import React, { useState, useRef, useEffect } from 'react';
import { Palette, Upload, Download, Sparkles, Image, RefreshCw, Type, Calendar, MapPin, User, Eye, FileImage } from 'lucide-react';
import { readPsd } from 'ag-psd';

export default function FlyerStudio({ members, leaders }) {
  // Flyer Template / Customization State
  const [templateImage, setTemplateImage] = useState(null);
  const [isProcessingPsd, setIsProcessingPsd] = useState(false);
  const [eventTitle, setEventTitle] = useState('NIGHT OF ANOINTED DANCE');
  const [themeText, setThemeText] = useState('Dancing Before The Throne');
  const [ministerName, setMinisterName] = useState('Leader Savannah Nguyen');
  const [eventDate, setEventDate] = useState('Sunday, August 24, 2026');
  const [eventTime, setEventTime] = useState('5:00 PM EST');
  const [venue, setVenue] = useState('Main Sanctuary Auditorium');

  // Styling Options
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#ff3b00');
  const [overlayDarkness, setOverlayDarkness] = useState(0.4);
  const [presetTheme, setPresetTheme] = useState('dark');

  const canvasRef = useRef(null);

  // Pre-built Background Presets
  const presets = [
    {
      id: 'p1',
      name: 'Stage Spotlights',
      url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
      defaultTitle: 'ANNUAL DANCE CONCERT',
      defaultTheme: 'Unbridled Praise'
    },
    {
      id: 'p2',
      name: 'Worship Lights',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      defaultTitle: 'YOUTH DANCE WORKSHOP',
      defaultTheme: 'Equipping Next Generation'
    },
    {
      id: 'p3',
      name: 'Choreography Night',
      url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80',
      defaultTitle: 'CHOREOGRAPHY MINISTRIES',
      defaultTheme: 'Spirit & Truth'
    }
  ];

  // Auto-render flyer to HTML5 Canvas whenever state changes
  useEffect(() => {
    renderCanvas();
  }, [templateImage, eventTitle, themeText, ministerName, eventDate, eventTime, venue, textColor, accentColor, overlayDarkness]);

  // Load initial preset
  useEffect(() => {
    loadPresetImage(presets[0].url);
  }, []);

  const loadPresetImage = (url) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      setTemplateImage(img);
    };
  };

  // Upload handler supporting both PSD and standard image formats
  const handleCustomTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPsd = file.name.toLowerCase().endsWith('.psd');

    if (isPsd) {
      setIsProcessingPsd(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target.result;
          const psd = readPsd(buffer);
          if (psd && psd.canvas) {
            const img = new window.Image();
            img.src = psd.canvas.toDataURL();
            img.onload = () => {
              setTemplateImage(img);
              setIsProcessingPsd(false);
            };
          } else {
            alert('Could not render preview from PSD file. Please ensure PSD file has a merged preview layer saved.');
            setIsProcessingPsd(false);
          }
        } catch (err) {
          alert('Failed to parse PSD file: ' + err.message);
          setIsProcessingPsd(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // JPG, PNG, WEBP, SVG
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          setTemplateImage(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Render High-Res Canvas Poster
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background Image or Fallback Gradient
    if (templateImage) {
      ctx.drawImage(templateImage, 0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Dark Overlay for readable text contrast
    if (overlayDarkness > 0) {
      ctx.fillStyle = `rgba(15, 23, 42, ${overlayDarkness})`;
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Top Decorative Border & Badge
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Organization Branding Header
    ctx.fillStyle = accentColor;
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GH DANCE MINISTERS PRESENTS', width / 2, 100);

    // Gold/Accent Divider Line
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, 115);
    ctx.lineTo(width / 2 + 120, 115);
    ctx.lineWidth = 2;
    ctx.strokeStyle = accentColor;
    ctx.stroke();

    // 4. Main Event Title
    ctx.fillStyle = textColor;
    ctx.font = '800 46px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    
    // Wrap long title text if needed
    const words = eventTitle.toUpperCase().split(' ');
    let line = '';
    let y = 220;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 120 && n > 0) {
        ctx.fillText(line, width / 2, y);
        line = words[n] + ' ';
        y += 55;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, width / 2, y);

    // 5. Theme Subheading
    if (themeText) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 500 24px "Inter", sans-serif';
      ctx.fillText(`Theme: "${themeText}"`, width / 2, y + 45);
    }

    // 6. Featured Minister / Leader Box
    if (ministerName) {
      const boxY = y + 120;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(width / 2 - 250, boxY, 500, 90);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.strokeRect(width / 2 - 250, boxY, 500, 90);

      ctx.fillStyle = accentColor;
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('FEATURED MINISTER & LEADER', width / 2, boxY + 30);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(ministerName, width / 2, boxY + 68);
    }

    // 7. Event Details Card at Bottom
    const footerY = height - 250;

    // Date & Time Box
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`📅 ${eventDate}`, width / 2, footerY);

    ctx.fillStyle = accentColor;
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`⏰ ${eventTime}`, width / 2, footerY + 45);

    // Venue Box
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 22px "Inter", sans-serif';
    ctx.fillText(`📍 ${venue}`, width / 2, footerY + 95);

    // Footer Tagline
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 15px "Inter", sans-serif';
    ctx.fillText('ALL ARE WELCOME • FREE ADMISSION', width / 2, height - 70);
  };

  // Download Generated High-Res PNG
  const handleDownloadFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Flyer_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Hero Banner */}
      <div 
        className="hero-banner"
        style={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
          boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.3)'
        }}
      >
        <div className="hero-text">
          <h2>🎨 Auto Flyer Designer & Event Studio</h2>
          <p>Upload any flyer template image or choose presets, customize event details, and auto-generate high-res posters.</p>
        </div>
        <button className="btn-hero" onClick={handleDownloadFlyer}>
          <Download size={18} />
          <span>Download High-Res Flyer (PNG)</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left Form: Flyer Customizer Controls */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} className="text-primary" /> 1. Upload Template or Select Preset
          </h3>

          {/* Preset Buttons */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Template Background Presets</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {presets.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', height: 'auto', textAlign: 'center' }}
                  onClick={() => {
                    loadPresetImage(p.url);
                    setEventTitle(p.defaultTitle);
                    setThemeText(p.defaultTheme);
                  }}
                >
                  <img src={p.url} alt={p.name} style={{ width: '100%', height: '40px', objectFit: 'cover', borderRadius: '4px', marginBottom: '4px' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Custom Template File */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Upload Custom Background / Photoshop Template</label>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
              <Upload size={16} /> {isProcessingPsd ? 'Parsing PSD Photoshop File...' : 'Upload Image or Photoshop File (.PSD, .PNG, .JPG)'}
              <input type="file" accept=".psd,image/*" style={{ display: 'none' }} onChange={handleCustomTemplateUpload} />
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Supports Adobe Photoshop (.PSD), PNG, and JPG templates.
            </span>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <Type size={20} className="text-primary" /> 2. Event Content & Leader Details
          </h3>

          <div className="form-group">
            <label className="form-label">Main Event Title</label>
            <input
              type="text"
              className="form-control"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. NIGHT OF ANOINTED DANCE"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theme / Subheading</label>
            <input
              type="text"
              className="form-control"
              value={themeText}
              onChange={(e) => setThemeText(e.target.value)}
              placeholder="e.g. Dancing Before The Throne"
            />
          </div>

          {/* Leader Select Dropdown */}
          <div className="form-group">
            <label className="form-label">Featured Minister / Leader</label>
            <select
              className="form-control"
              value={ministerName}
              onChange={(e) => setMinisterName(e.target.value)}
            >
              <option value="">-- Type Custom or Select Leader --</option>
              {leaders && leaders.map(l => (
                <option key={l.id} value={`${l.title} ${l.name}`}>{l.name} ({l.title})</option>
              ))}
              {members && members.map(m => (
                <option key={`m-${m.id}`} value={`Minister ${m.name}`}>{m.name} ({m.department || 'Member'})</option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="text"
                className="form-control"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="text"
                className="form-control"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue / Auditorium Address</label>
            <input
              type="text"
              className="form-control"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>

          {/* Color & Darkness Sliders */}
          <div className="form-grid" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Accent Highlight Color</label>
              <input
                type="color"
                className="form-control"
                style={{ height: '40px', padding: '4px' }}
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Background Dark Overlay ({Math.round(overlayDarkness * 100)}%)</label>
              <input
                type="range"
                min="0"
                max="0.85"
                step="0.05"
                className="form-control"
                value={overlayDarkness}
                onChange={(e) => setOverlayDarkness(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleDownloadFlyer}>
            <Download size={18} /> Download High-Res Poster Image
          </button>
        </div>

        {/* Right Canvas Live Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: '#0f172a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem', color: 'white', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} /> Live Canvas Poster Preview
            </h3>
            <span className="badge badge-purple">High-Res Render</span>
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', background: '#000000', borderRadius: '12px', padding: '1rem', overflow: 'hidden' }}>
            <canvas 
              ref={canvasRef} 
              style={{ 
                width: '100%', 
                maxWidth: '420px', 
                height: 'auto', 
                borderRadius: '8px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                aspectRatio: '4/5'
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
