import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { studyService } from '../services/studyService'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import dicomParser from 'dicom-parser'

const DicomViewerPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [imageUrls, setImageUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [imageLoading, setImageLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const elementRef = useRef(null)
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

  useEffect(() => {
    loadDicomImages()
  }, [id])

  const loadDicomImages = async () => {
    try {
      const result = await studyService.getStudyById(id)
      if (!result.success || !result.study) {
        navigate(`/studies/${id}`)
        return
      }

      const study = result.study
      
      if (!study.dicom_files || study.dicom_files.length === 0) {
        alert('No DICOM files available to view')
        navigate(`/studies/${id}`)
        return
      }

      // Filter for DICOM files only
      const dicomFiles = study.dicom_files.filter(file => file.file_type === 'dicom' || !file.file_type)
      
      if (dicomFiles.length === 0) {
        alert('No DICOM files available to view')
        navigate(`/studies/${id}`)
        return
      }

      // Generate signed URLs for all DICOM files
      const urls = []
      for (const file of dicomFiles) {
        const filePath = file.file_path || file.path
        if (!filePath) continue
        
        const { data, error } = await supabase.storage
          .from('dicom-files')
          .createSignedUrl(filePath, 3600) // 1 hour expiry

        if (error) {
          console.error('Error generating signed URL:', error)
          continue
        }

        if (data?.signedUrl) {
          urls.push(data.signedUrl)
        }
      }

      if (urls.length === 0) {
        alert('Failed to load DICOM files')
        navigate(`/studies/${id}`)
        return
      }

      setImageUrls(urls)
    } catch (error) {
      console.error('Error loading images:', error)
      alert('Failed to load images')
      navigate(`/studies/${id}`)
    } finally {
      setLoading(false)
    }
  }

  // Enable element once on mount, disable on unmount
  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

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
        setImageLoading(true)
        setError(null)

        try {
          cornerstone.getEnabledElement(element)
        } catch (e) {
          await new Promise(resolve => setTimeout(resolve, 100))
          if (!isMounted) return
        }

        if (element.offsetWidth === 0 || element.offsetHeight === 0) {
          throw new Error('Element has no dimensions')
        }

        const imageId = `wadouri:${imageUrls[currentIndex]}`
        console.log('Loading image:', imageId)

        const image = await cornerstone.loadImage(imageId)
        if (!isMounted) return
        
        console.log('Image loaded successfully')

        cornerstone.displayImage(element, image)
        cornerstone.resize(element, true)
        cornerstone.fitToWindow(element)

        const canvas = element.querySelector('canvas')
        console.log('Canvas:', canvas?.width, 'x', canvas?.height)
        console.log('Element:', element.offsetWidth, 'x', element.offsetHeight)

        setImageLoading(false)
      } catch (err) {
        console.error('Error loading image:', err)
        if (isMounted) {
          setError(`Failed to load DICOM image: ${err.message}`)
          setImageLoading(false)
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

  const handleClose = () => {
    navigate(`/studies/${id}`)
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{textAlign: 'center', color: 'var(--muted)', padding: '40px'}}>Loading DICOM images...</p>
      </div>
    )
  }

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="modal" style={{ display: 'flex' }}>
        <div className="modal-content" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2>No Images Available</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
            No DICOM files found for this study.
          </p>
          <button onClick={handleClose} className="btn-primary">Close</button>
        </div>
      </div>
    )
  }

  return (
    <article className="card" style={{ padding: '0', margin: '0', width: '100%', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '20px',
        padding: '20px 20px 0 20px',
        marginBottom: '20px',
        color: 'var(--ink)'
      }}>
        <button
          onClick={handleClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--panel)',
            color: 'var(--ink)',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease',
            fontFamily: 'inherit',
            fontSize: '14px',
            textDecoration: 'none'
          }}
        >
          ← Back to Study Information
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>DICOM Viewer</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.7 }}>
            Image {currentIndex + 1} of {imageUrls.length}
          </p>
        </div>
      </div>
      
      <div style={{ padding: '0 20px' }}>
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
          {imageLoading && (
            <div style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--muted)',
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
              color: 'var(--error)',
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
      </div>

      {/* Navigation Controls */}
      {imageUrls.length > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px',
          marginTop: '20px',
          padding: '0 20px 20px 20px'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            style={{
              background: currentIndex === 0 ? 'var(--muted)' : 'var(--brand)',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === imageUrls.length - 1}
            style={{
              background: currentIndex === imageUrls.length - 1 ? 'var(--muted)' : 'var(--brand)',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: currentIndex === imageUrls.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === imageUrls.length - 1 ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Next →
          </button>
        </div>
      )}
    </article>
  )
}

export default DicomViewerPage
