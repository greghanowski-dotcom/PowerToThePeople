// src/components/HtmlDocViewer.jsx
import { useEffect, useState } from 'react';

export default function HtmlDocViewer({ url }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!url) return;

        setLoading(true);
        fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error("Document not found");
                return response.text();
            })
            .then((text) => {
                setContent(text);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setContent("<div>Sorry, this document could not be found at: " + url + "</div>");
                setLoading(false);
            });
    }, [url]);

    //if (loading) return <div>Loading document...</div>;

    // 🚀 FIXED REMOVAL ENGINE: Strips out trailing white-space gaps, line breaks, 
    // and empty paragraphs from the bottom of your external HTML article files [INDEX]
    let cleanHtml = content
        .replace(/<p><\/p>/g, '<br>')
        .replace(/(<br\s*\/?>|\s|&nbsp;|<p>\s*<\/p>)+$/gi, ''); /* ✂️ Cuts trailing empty space at the end of the text string */

    return (
        /* Fits snug against your details accordion bottom line layout */
        <div className="imported-doc-content" style={{ marginTop: '0px', paddingTop: '0px', width: '100%' }}>
            <div dangerouslySetInnerHTML={{ __html: cleanHtml }} style={{ width: '100%' }} />
        </div>
    );
}
