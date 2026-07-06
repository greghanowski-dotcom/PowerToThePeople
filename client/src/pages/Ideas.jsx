
import React from 'react';

const Ideas = () => {
    const loadTopic = (topic) => {
        console.log(`Load topic: ${topic}`);
    };

    return (
        <main className="main-container">
            <aside className="left-panel">
                <h2>Political Topics</h2>
                <ul id="topic-list">
                    <li>
                        Universal Basic Income
                        <button className="topic-btn" onClick={() => loadTopic('ubi')}>
                            ?
                        </button>
                    </li>
                    <li>
                        Climate Policy
                        <button className="topic-btn" onClick={() => loadTopic('climate')}>
                            ?
                        </button>
                    </li>
                </ul>
            </aside>

            <section id="right-panel" className="right-panel">
                <p>Select a topic to begin the discussion.</p>
            </section>
        </main>
    );
};

export default Ideas;