import AIToolsTab from './ps/AIToolsTab'
import { ErrorBoundary } from '../components/ErrorBoundary'
import '../people-skills.css'

export default function TechnologyStack() {
  return (
    <div>
      <div className="page-header">
        <h1 style={{ padding: '5px' }}>Technology Stack</h1>
        <p>AI tools deployed across divisions — usage, adoption and departmental coverage</p>
      </div>
      <ErrorBoundary>
        <AIToolsTab />
      </ErrorBoundary>
    </div>
  )
}
