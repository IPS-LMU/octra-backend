import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ocb-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.css']
})
export class NotFoundPageComponent implements OnInit {
  public currentRoute = '';

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.url.subscribe(urls => {
      this.currentRoute = urls.map(a => a.path).join('/');
    });
  }

}
