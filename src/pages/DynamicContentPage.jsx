// src/pages/DynamicContentPage.jsx
import { useParams } from 'react-router-dom';
import HtmlDocViewer from '../components/HtmlDocViewer';

export default function DynamicContentPage() {
  const { slug } = useParams(); // e.g., 'carbon-tax'

  // 🚀 FIXED: Constructs the proper relative URL string matching your folder setup
  const documentUrl = `/html-docs/${slug}.html`;

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 🚀 FIXED: Passes the path downstream using the explicit 'url' prop property */}
      <HtmlDocViewer url={documentUrl} />
    </div>
  );
}
