/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {registerForNotifications} from './Components/Common/notificationService';

// Subscribe every install to the invoice push topic before the app mounts.
registerForNotifications();

AppRegistry.registerComponent(appName, () => App);
