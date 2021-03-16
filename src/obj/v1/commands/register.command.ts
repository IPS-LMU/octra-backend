import {ApiCommand} from './api.command';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {Express, Router} from 'express';
import {API} from '../API';

export class RegisterCommand extends ApiCommand {

    constructor() {
        super('registerUser', 'POST', '/v1/user/register');

        this._description = 'Creates an account for a given user.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        const requestStructure = {
            'name': 'string',
            'email': 'string',
            'password': 'string'
        };

        // relevant for reference creation
        const responseStructure = {
            'auth': 'true',
            'token': '<TOKEN>',
            'status': 'success',
            'data': '<ID>',
            'message': ''
        };

        this._requestStructure = JSON.stringify(requestStructure, null, 2);
        this._responseStructure = JSON.stringify(responseStructure, null, 2);
    }

    register = (app: Express, router: Router) => {
        router.route(this.url).post((req, res) => {
            this.do(req, res);
        });
    };

    do(req, res) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const hashedPassword = bcrypt.hashSync(req.body.password);
            answer.data = hashedPassword;

            // TODO create account in database
            answer.auth = true;
            answer.token = jwt.sign({id: 123123},
                API.settings.secret, {
                expiresIn: 86400 // expires in 24 hours
            });

            res.status(200).send(answer);
        } else {
            answer.status = 'error';
            answer.message = validation;
            res.status(400).send(answer);
        }
    }

    validate(params, body) {
        let errors = '';

        if (!body.hasOwnProperty('password')) {
            errors += 'Missing password field, ';
        }
        if (!body.hasOwnProperty('email')) {
            errors += 'Missing email field, ';
        }
        if (!body.hasOwnProperty('name')) {
            errors += 'Missing password name, ';
        }

        return errors;
    }
}
