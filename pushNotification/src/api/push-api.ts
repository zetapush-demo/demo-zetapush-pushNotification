import { NgZone } from '@angular/core';
import { Api, ZetaPushClient, createApi } from 'zetapush-angular';
import { Observable } from 'rxjs/Observable';

export class PushApi extends Api {

register(parameters: { token: string }): Promise<any> {
    return this.$publish('register', parameters);
}

send(parameters: { target: string, message: string }): Promise<any> {
    return this.$publish('send', parameters);
}

}

export function PushApiFactory(client: ZetaPushClient, zone: NgZone): PushApi {
return createApi(client, zone, PushApi) as PushApi;
}

export const PushApiProvider = {
provide: PushApi, useFactory: PushApiFactory, deps: [ ZetaPushClient, NgZone ]
};