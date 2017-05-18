This tutorial show how to send Push notifications with ZetaPush.

**pushNotification** : Mobile application to send and receive push notifications
**com.zetapush.tuto.pushNotification** : Server side that act as Push notification sender


# Push notification sending with ZetaPush #

### Introduction ###

ZetaPush is a Realtime Baas (Backend As A Service) providing the server infrastructure when you develop your connected applications. We manage the server side and you are dealing with your mobile, web, server applications and your connected objects.

To illustrate the implementation of a real use case, we will create a mobile application (based on *Ionic 2*) that allows us to send Push notifications. To simplify the tutorial, the application will also receive the Push notifications. Of course, there is no interest in doing this but we can see a basic implementation. In our case, we will only use the Android platform.

##### What is a Push notification #####

A Push notification is a message that is sent to a mobile application, most of the time to show a notification. For this, it is necessary to have a sending server that sends the notifications when it receives the order. Afterwards, it interacts with the Push server of each vendor (Android, Apple) to send the message. Here the sending server is implemented on the ZetaPush platform.

##### Prerequisite #####

In this tutorial, we will need to use *Eclipse*, *Angular* and *Ionic* so install it if necessary :

* **Eclipse** : [Download](https://www.eclipse.org/downloads/)
* **Angular** : `npm install -g @angular/cli`
* **Ionic** : `npm install -g ionic cordova`  

It is necessary to have a Gmail account to use the Google Push API.

### Development environment installation ###

As I said previously, we will use the ZetaPush platform as the sending server. This needs the registration of a application/device pair on our sending server and the communication with the Push server of vendors. For this, we will develop many *macroscripts* in *zms* ( language of the ZetaPush platform ) via an Eclipse plug-in. 

You need to begin with a *sandbox* on the ZetaPush platform : [Quickstart](https://doc.zetapush.com/quickstart/).


### Create a Google notification service ###

First, we need to create an application via the Google console developer and enable the GCM (Google Cloud Messaging) API that handles the Push notifications. Afterwards, you need to save the **API Key** and the **Sender ID**

##### Instructions #####

1. Create a new project from the console [Google API](https://code.google.com/apis/console)  
*At this time, you save the ID of the project given by Google when you type the name of your project.*

1. Save the API key [here](https://developers.google.com/mobile/add?platform=android&cntapi=gcm)  
*You select the project previously created, chose a package name and enable **Google Cloud Messaging**. At this time you get the **API key** and the **SenderID** .*


### ZetaPush Side ###

##### Explanations #####

At this time, you need to have a *sandbox* created on the ZetaPush platform and an application created on the developer console of Google (With the GCM API enabled).
Here are the instructions to use the ZetaPush platform as a sending server :

*   Create a notification Push service on our sandbox
*   Register the Google API on this service
*   Create macroscripts to register on Push services and send Push notifications

We need to have two macroscripts :

*   Registration on the Push server
*   Send a Push notification


##### Create the recipe #####

First, we create a recipe in Eclipse like this :
`File -> New -> ZMS Recipe`

Type a name and add your *sandboxId* as below then click on *Finish* :

![Create recipe](https://lh3.googleusercontent.com/--u5vnC_J-74/WQmOCiwt3NI/AAAAAAAAAAc/HpMFk6HXMA4FtHeOifRUCAd9KjtkBDVYwCLcB/s0/create_recipe.png "Create recipe")

A new project is created with the following elements :

* `src` directory with an example file `welcome.zms`
* `init.zms` file that serves to init services once deployed
* `README.md` file
* `recipe.zms` file that allows to create services you need
* `zms.properties` to manage global properties of the project
* `zms.user.properties` to manage user's properties

We begin to add a notification service. For this we change `recipe.zms` like this :

##### **recipe.zms** #####

	recipe com.zetapush.tuto.pushNotification 1.0.0;

    /** a simple authentication service */
    service auth = simple(__default);

    /** our code is run by this service */
    service code = macro(__default) for 'src';

    /** push notification service */
    service push = notif(__default);


Then we create an user to call macroscripts from the mobile application and we configure our notification service.

##### **init.zms** #####
    
    // create a test user, to be able to run/debug macros from the eclipse UI
	auth.memauth_createUser({
		login:'user',
		password:'password'
	});

    push.notifs_createApp({
        credential : "AIzaSyC0fixf0IB--LCrCaFshQe3KmU75VK-f0Q", // API Key
        applicationName : "testtutopushnotification",           // Application ID (Given by Google)
        platform : NotificationPlatform_GCM,                    // Platform for Android
        principal : null,                       
        appId : "testtutopushnotification"                      // name chosen
    });
    

Now we create the macroscripts. We create a `.zms` file in our `src` directory : `Right-click on this directory -> new -> File` then type the name `push.zms`. Here the two macroscripts :

##### **push.zms** #####

	// Register the device on the push notification service
    macroscript register(string token) {
        push.register({deviceToken : token, appId : "testtutopushnotification"});
    }

    // Send a push notification to the device previously registered
    macroscript send(string target, string message){
        push.send({target : __userKey, message : message});
    }


Some explanations are needed : you need to know that when the application wants to use the Push notifications, it asks the Push server, according to its platform, to return a token. This token is used in *register* macroscript. *appId* is our *appId* in the Push service (`init.zms`).
For the sending notification with the *send* macroscript, the target is our *userKey*. Of course, there is no interest to do this because the application asks to receive a notification from itself. Thereafter, we will can easily create a web application to send a notification on the mobile application.

The *register* macroscript needs to be called one time on each application (on startup for example) and the *send* macroscript can be called by anyone (From another application for example).

Now we deploy our code.

To deploy, we need to configure `zms.user.properties`. We need to type the sandbox id, active the upload and type our credentials as below :


##### **zms.properties** #####

	# the ID of your sandbox (create a sandbox on admin.zpush.io)
	zms.businessId=<sandboxId>
	# by default, upload is disabled.
	# It is recommended not to change the value here, 
	# but rather in your overrides file, zms.user.properties
	zms.upload.enabled=true
	
	# Some properties to be used by this recipe. Name them as you want
	com.zetapush.tuto.webRTC.test.user.email=<email>
	
	# These two properties will be read by the eclipse plugin to automatically connect to a 
	# zetapush server when your run/debug a macro from this recipe.
	zms.test.login=user
	zms.test.password=password

##### **zms.user.properties** #####

	# the ID of your own sandbox
	zms.businessId=<sandboxId>
	# your developer login (the one YOU use on the web site http://admin.zpush.io)
	zms.username=<email>
	# your developer password
	zms.password=<password>
	# change that to true to start uploading code to your sandbox
	zms.upload.enabled=true


We deploy our code by launching the red rocket.

Afterwards, the server part being complete, we will create an Ionic application. If you get deployment errors, check your credentials.

### Client 2 : Mobile application ###

Our mobile application is based on *Ionic 2*.

First, we create a new project :  
	
	$ ionic start ionicWebRTC blank --v2

We add the Android platform :  
	
	$ ionic platform add android

##### Management of dependencies#####

First of all, many plugins are useful (Push / LocalNotifications), we add them. *LocalNotification* is useful to show a real notification when the application receives a Push message.


	$ ionic plugin add phonegap-plugin-push --variable SENDER_ID=<senderID>
	$ ionic plugin add --save de.appplant.cordova.plugin.local-notification 
	$ npm install --save @ionic-native/push
	$ npm install --save @ionic-native/local-notifications  

We add the ZetaPush SDK dependency :

	$ npm install zetapush-js --save  
	$ npm install zetapush-angular --save  

The ZetaPush packages use *Angular 4* so update it :

	$ npm install @angular/{common,compiler,compiler-cli,core,forms,http,platform-browser,platform-browser-dynamic,platform-server,router,animations}@latest typescript@latest @ionic-native/core@latest --save  


Then we add providers for Push, LocalNotifications and ZetaPush SDK in our application.

##### **src/app/app.module.ts** #####

    import { ZetaPushClientConfig, ZetaPushModule } from 'zetapush-angular';
	import { Push } from '@ionic-native/push';
    import { LocalNotifications } from '@ionic-native/local-notifications';


        @NgModule({
    imports: [
        ..,
        ZetaPushModule
    ],
    providers: [
        ..,
        Push,
        LocalNotifications,
        { provide: ZetaPushClientConfig, useValue: { sandboxId: '<sandboxId>'}},
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
    })
    export class AppModule {}


##### Connection to the ZetaPush platform ######

We need to connect our application to the ZetaPush platform to call our previously written macroscripts.


##### **src/pages/home/home.ts** #####

	import { Component, OnInit } from '@angular/core';
    import { NavController, Platform } from 'ionic-angular';
    import { ZetaPushConnection } from 'zetapush-angular';
        
        @Component({
        selector: 'page-home',
        templateUrl: 'home.html'
        })
        
        export class HomePage implements OnInit {


        constructor(public navCtrl: NavController, private platform: Platform, private zpConnection: ZetaPushConnection) {}
        
        ngOnInit(): void {

                this.platform.ready().then(() => {
                    this.zpConnection.connect({'login':'user', 'password':'password'}).then(() => {
                        console.debug("ZetaPushConnection:OK");
                    })
                });
            }
	    }


At this time, the connection with the ZetaPush platform is operational. To check it, you can launch the web application and check the presence of `ZetaPushConnection::OK` in the logs of the browser.

To launch the application : `$ ionic serve` in a shell and you go to `http://localhost:8100`.

##### Create the user interface #####

Now, we create the structure of the page.

##### **src/pages/home/home.html** #####

    <ion-header>
        <ion-navbar>
            <ion-title>
            Push notification
            </ion-title>
        </ion-navbar>
    </ion-header>

    <ion-content padding>
        <button id="button" ion-button (click)="sendNotification()">Send notification</button>
    </ion-content>


We add some CSS.

##### **src/pages/home/home.scss** #####

	#button {
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        margin-top: 100px;
    }


##### Add the API #####

We add the ZetaPush API in our application.
We begin to create `src/api/webrtc-api.ts`.

##### **src/api/push-api.ts** #####

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


We import this service in our application.


##### **src/app/app.module.ts** #####

	import { PushApiProvider } from '../api/push-api';
	
	@NgModule({
	  providers: [
	    PushApiProvider,
	    { provide: ZetaPushClientConfig, useValue: { sandboxId: '<sandboxId>'}},
	    ...
	  ]
	})
	export class AppModule {}



##### Notification handle #####

Now we modify `src/app/home.ts` to handle notifications.

For this we begin to configure our Push notifications options (*options*) and we register on the sending service at the start-up (after a request to get the token from the Android Push service).

##### **src/app/home.ts** #####

	
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
                    senderID: '<senderId>'
            }
        };

        constructor(private localNotifications: LocalNotifications, private push: Push, private pushApi: PushApi, public navCtrl: NavController, private platform: Platform, private zpConnection: ZetaPushConnection) {}

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


Now the application is functional. We install and launch it on an Android device :

	$ ionic build android  
	$ adb install <apk> (arm version)  


### Conclusion ###

After this tutorial, we can see how to use a Push notification service with ZetaPush. This application only sends a Push notification to itself but it is easy to create a web application to send Push notifications to smartphones.


##### Source code #####

The source code of this tutorial is available on GitGub : [zetapush-demo/demo-zetapush-pushNotification](https://github.com/zetapush-demo/demo-zetapush-pushNotification)


