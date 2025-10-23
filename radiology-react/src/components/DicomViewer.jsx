import React, { useEffect, useRef, useState } from 'react'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import dicomParser from 'dicom-parser'

const DicomViewer = ({ imageUrls, onClose }) => {
  const elementRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize Cornerstone
  useEffect(() => {
    try {
      // Configure cornerstone WADO Image Loader
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser
      
      // Configure web worker
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
      
      setInitialized(true)
      console.log('Cornerstone initialized')
    } catch (err) {
      console.error('Cornerstone init error:', err)
      setError('Failed to initialize viewer')
    }
  }, [])

  // Load and display image
  useEffect(() => {
    if (!initialized || !elementRef.current || !imageUrls || imageUrls.length === 0) {
      return
    }

    const loadAndDisplayImage = async () => {
      try {
        setLoading(true)
        setError(null)

        const element = elementRef.current

        // Enable element
        cornerstone.enable(element)

        // Create WADO URI image ID
        const imageId = `wadouri:${imageUrls[currentIndex]}`
        console.log('Loading image:', imageId)

        // Load image
        const image = await cornerstone.loadImage(imageId)
        console.log('Image loaded successfully')

        // Display image
        cornerstone.displayImage(element, image)

        // Reset and fit viewport
        cornerstone.reset(element)
        cornerstone.fitToWindow(element)

        console.log('Image displayed and fitted to window')
        setLoading(false)
      } catch (err) {
        console.error('Error loading image:', err)
        setError(`Failed to load DICOM image: ${err.message}`)
        setLoading(false)
      }
    }

    loadAndDisplayImage()

    // Cleanup
    return () => {
      if (elementRef.current) {
        try {
          cornerstone.disable(elementRef.current)
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [initialized, currentIndex, imageUrls])

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
    <div className="modal" style={{ display: 'flex', background: 'rgba(0,0,0,0.95)' }}>
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px'
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
          flex: 1, 
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
              height: '100%',
              minHeight: '500px',
              display: loading || error ? 'none' : 'block',
              position: 'relative'
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
