import React, { useEffect, useRef, useState } from 'react'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import dicomParser from 'dicom-parser'

const DicomViewer = ({ imageUrls, onClose }) => {
  const elementRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isInitializedRef = useRef(false)

  // Initialize Cornerstone once globally
  useEffect(() => {
    if (isInitializedRef.current) return

    try {
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser
      
      const config = {
        maxWebWorkers: 1,
        startWebWorkersOnDemand: true,
        taskConfiguration: {
          decodeTask: {
            initializeCodecsOnStartup: false,
            usePDFJS: false,
            strict: false
          }
        }
      }
      
      cornerstoneWADOImageLoader.webWorkerManager.initialize(config)
      isInitializedRef.current = true
      console.log('Cornerstone initialized')
    } catch (err) {
      console.error('Cornerstone init error:', err)
    }
  }, [])

  // Enable element once on mount, disable on unmount
  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    // Wait for element to have non-zero dimensions
    const waitForDimensions = () => {
      return new Promise((resolve) => {
        const check = () => {
          if (element.offsetWidth > 0 && element.offsetHeight > 0) {
            console.log('Element has dimensions:', element.offsetWidth, 'x', element.offsetHeight)
            resolve()
          } else {
            requestAnimationFrame(check)
          }
        }
        check()
      })
    }

    waitForDimensions().then(() => {
      try {
        cornerstone.enable(element)
        console.log('Element enabled once')
      } catch (e) {
        console.error('Failed to enable element:', e)
      }
    })

    // Cleanup: disable only on unmount
    return () => {
      try {
        cornerstone.disable(element)
        console.log('Element disabled on unmount')
      } catch (e) {
        // Ignore
      }
    }
  }, [])

  // Load and display image when currentIndex changes
  useEffect(() => {
    if (!isInitializedRef.current || !elementRef.current || !imageUrls || imageUrls.length === 0) {
      return
    }

    let isMounted = true
    const element = elementRef.current

    const loadImage = async () => {
      try {
        setLoading(true)
        setError(null)

        // Verify element is enabled and has dimensions
        try {
          cornerstone.getEnabledElement(element)
        } catch (e) {
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 100))
          if (!isMounted) return
        }

        if (element.offsetWidth === 0 || element.offsetHeight === 0) {
          throw new Error('Element has no dimensions')
        }

        // Load image
        const imageId = `wadouri:${imageUrls[currentIndex]}`
        console.log('Loading image:', imageId)

        const image = await cornerstone.loadImage(imageId)
        if (!isMounted) return
        
        console.log('Image loaded successfully')

        // Display image
        cornerstone.displayImage(element, image)
        
        // Immediately resize and fit
        cornerstone.resize(element, true)
        cornerstone.fitToWindow(element)

        // Log dimensions
        const canvas = element.querySelector('canvas')
        console.log('Canvas:', canvas?.width, 'x', canvas?.height)
        console.log('Element:', element.offsetWidth, 'x', element.offsetHeight)

        setLoading(false)
      } catch (err) {
        console.error('Error loading image:', err)
        if (isMounted) {
          setError(`Failed to load DICOM image: ${err.message}`)
          setLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      isMounted = false
    }
  }, [currentIndex, imageUrls])

  // Add resize listener
  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current
    const handleResize = () => {
      try {
        cornerstone.resize(element, true)
        cornerstone.fitToWindow(element)
      } catch (e) {
        // Ignore if not enabled
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < imageUrls.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="modal" style={{ display: 'flex' }}>
        <div className="modal-content" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2>No Images Available</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
            No DICOM files found for this study.
          </p>
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'block', 
      background: 'rgba(0,0,0,0.95)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          color: 'white'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>DICOM Viewer</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.7 }}>
              Image {currentIndex + 1} of {imageUrls.length}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Viewer Container */}
        <div style={{ 
          width: '100%',
          height: '700px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          background: '#000',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {loading && (
            <div style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '16px',
              zIndex: 10
            }}>
              Loading DICOM image...
            </div>
          )}
          
          {error && (
            <div style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#ff6b6b',
              fontSize: '16px',
              textAlign: 'center',
              padding: '20px',
              maxWidth: '80%',
              zIndex: 10
            }}>
              {error}
            </div>
          )}
          
          <div 
            ref={elementRef}
            style={{ 
              width: '100%', 
              height: '700px'
            }}
          />
        </div>

        {/* Navigation Controls */}
        {imageUrls.length > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px',
            marginTop: '20px'
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.5 : 1,
                fontSize: '14px'
              }}
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === imageUrls.length - 1}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: currentIndex === imageUrls.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === imageUrls.length - 1 ? 0.5 : 1,
                fontSize: '14px'
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DicomViewer
