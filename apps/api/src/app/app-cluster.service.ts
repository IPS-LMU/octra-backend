import * as _cluster from 'cluster';
import {cpus} from 'os';
import * as process from 'process';
import {Injectable} from '@nestjs/common';
import {Configuration} from '@octra/server-side';
import {interval, Subscription} from 'rxjs';
import {FileSystemHandler} from './obj/filesystem-handler';
import * as Path from 'path';

const cluster = _cluster as unknown as _cluster.Cluster
const numCPUs = cpus().length;
const config = Configuration.getInstance();

@Injectable()
export class AppClusterService {
  private static isShuttingDown = false;
  private static hasCleanWorkerExit = false;
  private static processStr = `${cluster.isPrimary ? 'master' : 'worker'} process ${process.pid}`;
  private static shutdownSubscription: Subscription;

  static async buildCluster(callback: () => void) {
    if (config.api.performance?.cluster?.enabled) {
      if (cluster.isPrimary) {
        console.log(`Master server started on ${process.pid}`);
        await this.createWorkers();
        process.on('SIGTERM', this.gracefulClusterShutdown('SIGTERM'))
        process.on('SIGINT', this.gracefulClusterShutdown('SIGINT'))
      } else {
        console.log(`Cluster server started on ${process.pid}`)
        process.on('SIGTERM', this.gracefulClusterShutdown('SIGTERM'))
        process.on('SIGINT', this.gracefulClusterShutdown('SIGINT'))
        callback();
      }
    } else {
      console.log(`Start app without cluster`);
      callback();
    }
  }

  static async createWorkers() {
    const maxParallelWorkers =
      config.api.performance.cluster.maxParallelWorkers && config.api.performance.cluster.maxParallelWorkers > 0
        ? config.api.performance.cluster.maxParallelWorkers : numCPUs;

    for (let i = 0; i < maxParallelWorkers; i++) {
      cluster.fork();
    }

    cluster.on('online', worker => {
      console.log(`worker process ${worker.process.pid} is online`)
    });

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} exited with code ${code} and signal ${signal}`);
      if (this.isShuttingDown && code != 0) {
        this.hasCleanWorkerExit = false
      } else if (!this.isShuttingDown && code != 0) {
        // worker died
        console.log(`Worker ${worker.process.pid} died. Restarting`);
        cluster.fork();
      }
    });

    cluster.on('disconnect', worker => {
      console.log(`worker process ${worker.process.pid} has disconnected`)
    });
  }

  private static gracefulClusterShutdown(signal: NodeJS.Signals) {
    return async (signal) => {
      if (this.isShuttingDown) {
        return;
      }

      this.isShuttingDown = true;
      this.hasCleanWorkerExit = true;

      console.log(`Got ${signal} on ${this.processStr}. Graceful shutdown start at ${new Date().toISOString()}`);

      try {
        if (cluster.isPrimary) {
          console.log(`\nAPI is shutting down...`);
          await this.shutdownWorkers(signal);
        }
        await this.stop() //stop yourself after the workers are shutdown if you are master
        console.log(`${this.processStr} shutdown successful`);
        process.exit(0);
      } catch (e) {
        console.log(`ERROR`);
        console.log(e);
        process.exit(1);
      }
    };
  }

  private static async shutdownWorkers(signal: NodeJS.Signals) {
    return new Promise<void>((resolve) => {
      if (!cluster.isPrimary) {
        return resolve();
      }

      const wIds = Object.keys(cluster.workers)
      if (wIds.length == 0) {
        return resolve();
      }
      //Filter all the valid workers
      const workers = wIds.map(id => cluster.workers[id]).filter(v => v) as _cluster.Worker[]
      let workersAlive = 0
      let funcRun = 0

      //Count the number of alive workers and keep looping until the number is zero.
      const fn = () => {
        ++funcRun
        workersAlive = 0
        workers.forEach(worker => {
          if (!worker.isDead()) {
            ++workersAlive
            if (funcRun == 1) {
              //On the first execution of the function, send the received signal to all the workers
              console.log(`kill worker`);
              worker.kill(signal)
            }
          }
        })
        if (workersAlive == 0) {
          //Clear the interval when all workers are dead
          this.shutdownSubscription.unsubscribe();
          return resolve();
        }
      };

      this.shutdownSubscription = interval(500).subscribe(() => {
        fn();
      });
    });
  }

  private static async stop() {
    this.shutdownSubscription ? this.shutdownSubscription.unsubscribe() : undefined;

    if (cluster.isPrimary) {
      try {
        await FileSystemHandler.removeFolder(Path.join(config.api.paths.uploadFolder, 'tmp'));
        console.log(`-> Remove temporary folder OK`)
      } catch (e) {
        console.log(`ERROR: ${e}`);
      }
    }
    return;
  }
}
