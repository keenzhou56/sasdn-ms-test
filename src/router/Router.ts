import * as Router from "koa-router";
import {GatewayApiBase} from "sasdn";

const API_PATHS = [
    '../router/demo/DemoApiService/postGetDemoOrderApi',
];

export default class RouteLoader {
    private static _instance: RouteLoader;

    private _initialized: boolean;
    private _router: Router;

    private constructor() {
        this._initialized = false;
        this._router = new Router();
    }

    public static instance(): RouteLoader {
        if (RouteLoader._instance === undefined) {
            RouteLoader._instance = new RouteLoader();
        }
        return RouteLoader._instance;
    }

    public init(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // create koa-router
            let queue = [] as Array<Promise<void>>;
            for (let path of API_PATHS) {
                queue.push(this._createRouter(path));
            }

            // promise queue
            Promise.all(queue).then(() => {
                this._initialized = true;
                resolve(true);
            }).catch((err: Error) => {
                reject(err);
            });
        });
    }

    public getRouter(): Router {
        return this._router;
    }

    private async _createRouter(path: string): Promise<void> {
        try {
            let api = require(path).api as GatewayApiBase;
            this._router[api.method].apply(this._router, api.register());
        } catch (err) {
            console.error(err.toString());
        }
    }
}