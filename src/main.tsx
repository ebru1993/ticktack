import { render } from 'preact'
import { App } from './app.tsx'
import './index.css'
import { registerPwa } from './pwa.ts'

registerPwa()
render(<App />, document.getElementById('app')!)
