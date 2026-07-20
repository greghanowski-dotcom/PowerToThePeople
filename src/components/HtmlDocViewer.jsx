// src/components/HtmlDocViewer.jsx
import { useEffect, useState } from 'react';

export default function HtmlDocViewer({ url }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!url) return;

        setLoading(true);
        // Fetch the file using the full path passed from Ideas.jsx
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

    if (loading) return <div>Loading document...</div>;
    // Replace empty paragraph tags with a line break because they are being ignored
    const html = content.replace(/<p><\/p>/g, '<br>');

    return (
        <div
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}