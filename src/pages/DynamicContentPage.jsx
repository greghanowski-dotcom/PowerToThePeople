// src/pages/DynamicContentPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function DynamicContentPage() {
  const { slug } = useParams(); // Captures the lowercase url path string (e.g., 'universal-healthcare')
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setErrorMessage('');

    // 🚀 STEP 1: Fetch your central catalog data file first
    fetch('/html-docs/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error("Could not load the catalog manifest data records.");
        return res.json();
      })
      .then((manifestItems) => {
        if (!Array.isArray(manifestItems)) throw new Error("Manifest data structure is corrupted.");

        // 🚀 STEP 2: Find the specific data row matching the current URL slug string
        const matchingInitiative = manifestItems.find(item => {
          const itemUrlTitle = item.title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
          return itemUrlTitle === slug;
        });

        if (!matchingInitiative) {
          throw new Error(`No matching public initiative item found for path slug: "${slug}".`);
        }

        // 🚀 STEP 3: Read the category string parameter dynamically to build the folder path!
        // This converts into: "/html-docs/Healthcare & Social Safety/universal-healthcare.html"
        const folderCategoryName = matchingInitiative.category.trim();
        const absoluteAssetUrl = `/html-docs/${folderCategoryName}/${slug}.html`;

        console.log("[ROUTER ENGINE] Attempting loading from fluid directory path location:", absoluteAssetUrl);

        // 🚀 STEP 4: Fetch the actual raw HTML policy article text file
        return fetch(absoluteAssetUrl);
      })
      .then((res) => {
        if (!res) return; // Prevent bubble errors if previous catch handles fired
        if (!res.ok) throw new Error("The raw HTML document file could not be found inside that specific category folder layout.");
        return res.text();
      })
      .then((htmlText) => {
        if (htmlText) {
          setContent(htmlText);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage(err.message || "An unexpected asset ingestion error occurred.");
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="content-area">⏳ Ingesting public initiative layout parameters...</div>;

  return (
    <div className="content-area layout-panel-wide" style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Dynamic Back Navigation Anchor Hook Links */}
      <Link to="/surveys" style={{ color: '#0070f3', fontWeight: 'bold', textDecoration: 'underline', display: 'block', marginBottom: '20px' }}>
        ← Return back to public voter initiatives
      </Link>
      
      {/* Error Shield Warning Feedback Banner Screen Canvas */}
      {errorMessage ? (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', borderRadius: '6px', fontSize: '14px', lineHeight: '1.5' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Document Load Error</strong>
          <p style={{ margin: 0 }}>{errorMessage}</p>
          <small style={{ display: 'block', marginTop: '10px', color: '#7f1d1d' }}>
            💡 Quick Check: Confirm that your folder inside <code>public/html-docs/</code> matches your manifest category string exactly.
          </small>
        </div>
      ) : (
        /* Injects your text content fields cleanly onto the screen view page canvas */
        <div dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </div>
  );
}
