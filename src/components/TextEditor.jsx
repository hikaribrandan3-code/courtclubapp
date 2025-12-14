import { useRef, useEffect, useCallback, useState } from 'react'
import './TextEditor.css'

/**
 * TextEditor Component - Hikari CamTech Engine v3.1
 * IG-style text input with font/color/alignment/style tools
 * Structure follows Image B (Instagram) exactly
 */

// 6 Fonts per PRD
const FONTS = [
    { id: 'classic', label: 'Classic', family: '-apple-system, BlinkMacSystemFont, sans-serif' },
    { id: 'bold', label: 'Bold', family: '-apple-system, BlinkMacSystemFont, sans-serif', weight: '700' },
    { id: 'serif', label: 'Serif', family: 'Georgia, Times New Roman, serif' },
    { id: 'mono', label: 'Mono', family: 'SF Mono, Menlo, monospace' },
    { id: 'condensed', label: 'Condensed', family: 'Arial Narrow, sans-serif' },
    { id: 'script', label: 'Script', family: 'Snell Roundhand, cursive' }
]

// Color palette (Instagram-style)
const COLORS = [
    '#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00',
    '#34C759', '#00C7BE', '#007AFF', '#5856D6', '#AF52DE',
    '#FF2D55', '#A2845E', '#8E8E93', '#C7C7CC', '#48484A'
]

// Style modes
const STYLE_MODES = [
    { id: 'stroke', label: 'Aa', icon: 'stroke' },
    { id: 'background', label: 'Aa', icon: 'background' },
    { id: 'highlight', label: 'Aa', icon: 'highlight' }
]

// Alignment options
const ALIGNMENTS = [
    { id: 'left', icon: 'left' },
    { id: 'center', icon: 'center' },
    { id: 'right', icon: 'right' }
]

export default function TextEditor({
    isActive,
    initialText,
    initialStyle,
    position,
    onSave,
    onCancel,
    onStyleChange
}) {
    const inputRef = useRef(null)
    const containerRef = useRef(null)

    // Keyboard positioning - single lock after animation settles
    const [keyboardOffset, setKeyboardOffset] = useState(0)
    const layoutLockTimeoutRef = useRef(null)
    const isLayoutLockedRef = useRef(false)

    // Text style state
    const [currentStyle, setCurrentStyle] = useState({
        fontId: initialStyle?.fontId || 'classic',
        color: initialStyle?.color || '#FFFFFF',
        textAlign: initialStyle?.textAlign || 'center',
        styleMode: initialStyle?.styleMode || null
    })

    // Get current font config
    const getCurrentFont = () => FONTS.find(f => f.id === currentStyle.fontId) || FONTS[0]

    // Update style and notify parent
    const updateStyle = (updates) => {
        const newStyle = { ...currentStyle, ...updates }
        setCurrentStyle(newStyle)
        if (onStyleChange) {
            onStyleChange(newStyle)
        }
    }

    // Keyboard-aware positioning with debounced one-time lock
    // Waits for iOS keyboard animation to settle (~150ms), then locks position
    useEffect(() => {
        if (!isActive) {
            // Reset on deactivation
            setKeyboardOffset(0)
            isLayoutLockedRef.current = false
            if (layoutLockTimeoutRef.current) {
                clearTimeout(layoutLockTimeoutRef.current)
                layoutLockTimeoutRef.current = null
            }
            return
        }

        // Measure keyboard height once after animation settles
        const measureAndLock = () => {
            if (window.visualViewport) {
                const viewportHeight = window.visualViewport.height
                const windowHeight = window.innerHeight
                const offset = windowHeight - viewportHeight - window.visualViewport.offsetTop
                setKeyboardOffset(Math.max(0, offset))
            }
            isLayoutLockedRef.current = true
        }

        // Delay measurement to allow keyboard animation to complete
        // 150ms is sufficient for iOS keyboard animation
        layoutLockTimeoutRef.current = setTimeout(measureAndLock, 150)

        return () => {
            if (layoutLockTimeoutRef.current) {
                clearTimeout(layoutLockTimeoutRef.current)
                layoutLockTimeoutRef.current = null
            }
        }
    }, [isActive])

    // Focus input when activated
    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus()
            const len = inputRef.current.value.length
            inputRef.current.setSelectionRange(len, len)
        }
    }, [isActive])

    // Reset style when initialStyle changes
    useEffect(() => {
        if (initialStyle) {
            setCurrentStyle({
                fontId: initialStyle.fontId || 'classic',
                color: initialStyle.color || '#FFFFFF',
                textAlign: initialStyle.textAlign || 'center',
                styleMode: initialStyle.styleMode || null
            })
        }
    }, [initialStyle])

    // Handle tap outside to finish
    const handleContainerClick = useCallback((e) => {
        if (e.target === containerRef.current) {
            const text = inputRef.current?.value?.trim()
            if (text) {
                onSave(text, currentStyle)
            } else {
                onCancel()
            }
        }
    }, [onSave, onCancel, currentStyle])

    // Handle keyboard submit
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            const text = inputRef.current?.value?.trim()
            if (text) {
                onSave(text, currentStyle)
            } else {
                onCancel()
            }
        } else if (e.key === 'Escape') {
            onCancel()
        }
    }, [onSave, onCancel, currentStyle])

    // Get text style for preview
    const getTextStyle = () => {
        const font = getCurrentFont()
        const style = {
            fontFamily: font.family,
            fontWeight: font.weight || '400',
            color: currentStyle.color,
            textAlign: currentStyle.textAlign
        }

        // Apply style mode
        if (currentStyle.styleMode === 'stroke') {
            style.WebkitTextStroke = `1px ${currentStyle.color}`
            style.color = 'transparent'
        } else if (currentStyle.styleMode === 'background') {
            style.backgroundColor = currentStyle.color
            style.color = currentStyle.color === '#FFFFFF' || currentStyle.color === '#FFCC00' ? '#000' : '#FFF'
            style.padding = '4px 12px'
            style.borderRadius = '4px'
        } else if (currentStyle.styleMode === 'highlight') {
            style.backgroundColor = currentStyle.color
            style.color = currentStyle.color === '#FFFFFF' || currentStyle.color === '#FFCC00' ? '#000' : '#FFF'
            style.padding = '8px 16px'
            style.borderRadius = '8px'
        }

        return style
    }

    if (!isActive) return null

    return (
        <div
            ref={containerRef}
            className="text-editor-overlay"
            onClick={handleContainerClick}
        >
            {/* Text Input Area */}
            <div className="text-input-container" style={{ top: position?.y || '40%' }}>
                <textarea
                    ref={inputRef}
                    defaultValue={initialText || ''}
                    onKeyDown={handleKeyDown}
                    placeholder="Type here..."
                    autoCapitalize="sentences"
                    autoCorrect="on"
                    className="text-input"
                    style={getTextStyle()}
                    rows={1}
                    onInput={(e) => {
                        e.target.style.height = 'auto'
                        e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                />
            </div>

            {/* Styling Tools Container - Bottom, keyboard-aware with locked position */}
            <div
                className="text-styling-tools"
                style={{ bottom: keyboardOffset > 0 ? `${keyboardOffset}px` : undefined }}
            >
                {/* Font Row */}
                <div className="font-row">
                    {FONTS.map((font) => (
                        <button
                            key={font.id}
                            className={`font-button ${currentStyle.fontId === font.id ? 'font-button-active' : ''}`}
                            onMouseDown={(e) => {
                                // Prevent focus loss from textarea (desktop fix)
                                e.preventDefault()
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                updateStyle({ fontId: font.id })
                                // Refocus textarea to maintain edit state
                                inputRef.current?.focus()
                            }}
                            style={{ fontFamily: font.family, fontWeight: font.weight }}
                        >
                            {font.label}
                        </button>
                    ))}
                </div>

                {/* Color Row */}
                <div className="color-row">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            className={`color-button ${currentStyle.color === color ? 'color-button-active' : ''}`}
                            onMouseDown={(e) => {
                                // Prevent focus loss from textarea (desktop fix)
                                e.preventDefault()
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                updateStyle({ color })
                                // Refocus textarea to maintain edit state
                                inputRef.current?.focus()
                            }}
                            style={{ backgroundColor: color }}
                            aria-label={`Color ${color}`}
                        />
                    ))}
                </div>

                {/* Tools Row: Alignment + Style Toggles */}
                <div className="tools-row">
                    {/* Alignment Icons */}
                    <div className="alignment-group">
                        {ALIGNMENTS.map((align) => (
                            <button
                                key={align.id}
                                className={`align-button ${currentStyle.textAlign === align.id ? 'align-button-active' : ''}`}
                                onMouseDown={(e) => {
                                    // Prevent focus loss from textarea (desktop fix)
                                    e.preventDefault()
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    updateStyle({ textAlign: align.id })
                                    // Refocus textarea to maintain edit state
                                    inputRef.current?.focus()
                                }}
                                aria-label={`Align ${align.id}`}
                            >
                                {align.id === 'left' && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
                                    </svg>
                                )}
                                {align.id === 'center' && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
                                    </svg>
                                )}
                                {align.id === 'right' && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Style Mode Toggles */}
                    <div className="style-group">
                        {STYLE_MODES.map((mode) => (
                            <button
                                key={mode.id}
                                className={`style-button style-button-${mode.id} ${currentStyle.styleMode === mode.id ? 'style-button-active' : ''}`}
                                onMouseDown={(e) => {
                                    // Prevent focus loss from textarea (desktop fix)
                                    e.preventDefault()
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    // Toggle off if same, otherwise set
                                    updateStyle({ styleMode: currentStyle.styleMode === mode.id ? null : mode.id })
                                    // Refocus textarea to maintain edit state
                                    inputRef.current?.focus()
                                }}
                                aria-label={`Style ${mode.id}`}
                            >
                                <span className={`style-preview style-preview-${mode.id}`}>Aa</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
