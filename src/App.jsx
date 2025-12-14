import { useState } from 'react'
import CameraLayer from './components/CameraLayer.jsx'
import EditorLayer from './components/EditorLayer.jsx'
import SettingsSheet from './components/SettingsSheet.jsx'
import './App.css'

/**
 * CamTech v1.7
 * Production release - Manual pixel filters, no ctx.filter
 * Modes: CAMERA | EDITOR | SETTINGS
 */
export const VERSION = 'CamTech v1.7'

function App() {
    const [mode, setMode] = useState('CAMERA')
    const [capturedImage, setCapturedImage] = useState(null)
    const [showSettings, setShowSettings] = useState(false)
    const [toolPosition, setToolPosition] = useState('right')

    const handleCapture = (imageData) => {
        if (!imageData) return
        setCapturedImage(imageData)
        setMode('EDITOR')
    }

    const handleRetake = () => {
        setCapturedImage(null)
        setMode('CAMERA')
    }

    // Handle Done - called after successful export/share
    // Does NOT reset to camera - only Retake does that
    const handleDone = () => {
        // After successful share, stay in editor or show confirmation
        // The actual sharing happens in EditorLayer via exportAndShare
        // This callback is called after share completes
        // For now, just return to camera as there's no dedicated share screen
        setCapturedImage(null)
        setMode('CAMERA')
    }

    const handleOpenSettings = () => {
        setShowSettings(true)
    }

    const handleCloseSettings = () => {
        setShowSettings(false)
    }

    const handleToolPositionChange = (position) => {
        setToolPosition(position)
    }

    return (
        <div className="app-root">
            <div className="app-frame">
                <div className="hikari-app">
                    {mode === 'CAMERA' && (
                        <CameraLayer
                            onCapture={handleCapture}
                            onOpenSettings={handleOpenSettings}
                            toolPosition={toolPosition}
                        />
                    )}

                    {mode === 'EDITOR' && capturedImage && (
                        <EditorLayer
                            imageData={capturedImage}
                            onRetake={handleRetake}
                            onDone={handleDone}
                            toolPosition={toolPosition}
                        />
                    )}

                    {showSettings && (
                        <SettingsSheet
                            toolPosition={toolPosition}
                            onToolPositionChange={handleToolPositionChange}
                            onClose={handleCloseSettings}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default App
