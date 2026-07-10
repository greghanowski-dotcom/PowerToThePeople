// src/pages/DynamicContentPage.jsx
import { useParams } from 'react-router-dom';
import HtmlDocViewer from '../components/HtmlDocViewer';

export default function DynamicContentPage() {
  const { slug } = useParams(); // e.g., 'carbon-tax'

  return (
    <div className="page-container">
      {/* This will fetch /documents/carbon-tax.html automatically */}
      <HtmlDocViewer fileName={slug} />
    </div>
  );
}