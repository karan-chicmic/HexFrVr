// import { UserDataSingleton } from "../Singleton/UserDataSingleton";

// export class AnotherClass extends Component {
//     userDataSingleton: UserDataSingleton;

//     start() {
//         this.userDataSingleton = UserDataSingleton.getInstance();

//         // Access users data
//         console.log(this.userDataSingleton.users.name);
//         // Other logic...
//     }
// }
// // import { _decorator, sys } from "cc";
// // const { ccclass, property } = _decorator;

// // @ccclass("DataSingleton")
// // export class DataSingleton {
// //     private static instance: DataSingleton;
// //     public users = {
// //         name: "",
// //         mode1Level: 0,
// //         mode2Level: 0,
// //         mode3Level: 0,
// //         mode4Level: 0,
// //     };

// //     private constructor() {}

// //     public static getInstance(): DataSingleton {
// //         if (!DataSingleton.instance) {
// //             DataSingleton.instance = new DataSingleton();
// //         }
// //         return DataSingleton.instance;
// //     }

// //     public loadFromLocalStorage(name: string) {
// //         const userData = sys.localStorage.getItem(name);
// //         if (userData) {
// //             this.users = JSON.parse(userData);
// //         }
// //     }

// //     public saveToLocalStorage(name: string) {
// //         sys.localStorage.setItem(name, JSON.stringify(this.users));
// //     }
// //     private static _instance: DataSingleton | null = null;

// //     private _data: { [key: string]: any } = {};

// //     public setData(key: string, value: any): void {
// //         this._data[key] = value;
// //     }

// //     public getData(key: string): any | null {
// //         return this._data[key] || null;
// //     }
// // }
// // start() {
// //     // Initialize singletons
// //     this.dataSingleton = DataSingleton.getInstance();
// //     this.userDataSingleton = UserDataSingleton.getInstance();

// //     this.userDataSingleton.loadFromLocalStorage(this.dataSingleton.getData("name"));

// //     // Other initialization code...
// // }

// // changeLocalStorage() {
// //     this.userDataSingleton.users.name = this.dataSingleton.getData("name");
// //     this.userDataSingleton.users.mode1Level = this.dataSingleton.getData("mode1Level");
// //     this.userDataSingleton.users.mode2Level = this.dataSingleton.getData("mode2Level");
// //     this.userDataSingleton.users.mode3Level = this.dataSingleton.getData("mode3Level");
// //     this.userDataSingleton.users.mode4Level = this.dataSingleton.getData("mode4Level");

// //     this.userDataSingleton.saveToLocalStorage(this.userDataSingleton.users.name);
// // }
// import { _decorator, Component, Node } from 'cc';
// const { ccclass, property } = _decorator;

// @ccclass('aa')
// export class aa extends Component {
//     start() {

//     }

//     update(deltaTime: number) {
        
//     }
// }

