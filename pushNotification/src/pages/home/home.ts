import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ZetaPushConnection } from 'zetapush-angular';
import { PushApi } from '../../api/push-api';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';
    
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage implements OnInit {

    pushObject: PushObject;
    options: PushOptions = {
        android: {
                senderID: '<sendboxID>'
        }
    };

    constructor(
        private localNotifications: LocalNotifications, 
        private push: Push, 
        private pushApi: PushApi, 
        public navCtrl: NavController, 
        private platform: Platform, 
        private zpConnection: ZetaPushConnection) {}

    ngOnInit(): void {

        this.platform.ready().then(() => {
            this.zpConnection.connect({'login':'user', 'password':'password'}).then(() => {
                console.debug("ZetaPushConnection:OK");
                this.configurePush();
            })
        });
    }

    sendNotification(): void {
        console.debug("Send notification");
        this.pushApi.send({'target':'user', 'message':'Hello world'});
    }		

    
    configurePush(): void {
        // Get token from Android Push service
        this.pushObject = this.push.init(this.options);

        // We show a notification when we receive a push message
        this.pushObject.on('notification').subscribe((notification: any) => {
            console.log('Received a notification', notification);
            this.localNotifications.schedule({
            id: 1,
            text: notification.message
            });
        });
        
        // Registration on Send server (ZetaPush) after get token from Android Push Service
        this.pushObject.on('registration').subscribe((registration: any) => {
            console.log('Device registered', registration);
            this.pushApi.register({'token': registration.registrationId});
        });
        
        this.pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
    }
}