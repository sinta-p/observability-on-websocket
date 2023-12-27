import Vue from "vue";
import App from "./App.vue";
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs'

datadogRum.init({
    applicationId: '0f97d97a-a031-4315-917b-633106c3a6da',
    clientToken: 'pub07775eb94815196075ca06c520ff4488',
    site: 'datadoghq.com',
    service: 'chat-app',
    env: 'dev',
    // Specify a version number to identify the deployed version of your application in Datadog 
    // version: '1.0.0', 
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'allow',
});

datadogLogs.init({
  clientToken: 'pub07775eb94815196075ca06c520ff4488',
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  forwardConsoleLogs: "all",
  sessionSampleRate: 100,
})

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
