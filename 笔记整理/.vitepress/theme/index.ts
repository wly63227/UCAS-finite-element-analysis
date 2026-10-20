import DefaultTheme from 'vitepress/theme'
import BarycentricDemo from './BarycentricDemo.vue'
import './style.css'
export default {...DefaultTheme,enhanceApp({app}){app.component('BarycentricDemo',BarycentricDemo)}}
