// src/components/HtmlDocViewer.jsx
import { useEffect, useState } from 'react';

export default function HtmlDocViewer({ fileName }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the file from the public folder
        fetch(`/html-docs/${fileName}.html`)
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
                setContent("<div>Sorry, this document could not be found.</div>");
                setLoading(false);
            });
    }, [fileName]); // Re-fetch whenever the fileName changes

    if (loading) return <div>Loading document...</div>;

    // Use a specific class wrapper so your app's main styles don't conflict
    // with the document's styles.
    return (
        <div
            className="imported-doc-content"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}