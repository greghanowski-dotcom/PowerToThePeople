import React, { useState } from 'react';
import '../styles/Survey.css'; // 🚀 CRITICAL LINK PERMANENTLY LOCKED IN GOING FORWARD

export default function Survey({ isLoggedIn, openModal }) {
    // Independent states to track the user's active selections
    const [trumpGrade, setTrumpGrade] = useState('');
    const [congressGrade, setCongressGrade] = useState('');
    const [gopGrade, setGopGrade] = useState('');
    const [demGrade, setDemGrade] = useState('');
    const [presidentMessage, setPresidentMessage] = useState('');
    const [economyRating, setEconomyRating] = useState('');
    const [selectedIssues, setSelectedIssues] = useState([]);
    const [personalReason, setPersonalReason] = useState(''); // 📝 Tracks open-ended personal reasoning
    
    const [isSubmitting, setIsLoading] = useState(false);
    const [surveyMessage, setSurveyMessage] = useState({ text: '', type: '' });

    const letterGrades = ['A', 'B', 'C', 'D', 'F'];
    const economyOptions = ['Excellent', 'Good', 'Fair', 'Poor'];
    
    const civicIssuesOptions = [
        "Economy", "Cost of Living", "Crime", "Immigration & Border", 
        "Election Integrity", "Energy", "Global Warming", "Spending & Debt", 
        "National Security", "Education", "Healthcare", "Other"
    ];

    const handleIssueToggleClick = (issue) => {
        if (isSubmitting) return;

        setSelectedIssues((prevChoices) => {
            if (prevChoices.includes(issue)) {
                return prevChoices.filter(item => item !== issue);
            }
            if (prevChoices.length >= 3) {
                return prevChoices; 
            }
            return [...prevChoices, issue];
        });
    };

    const handleCastBallotSubmit = async (e) => {
        e.preventDefault();
        setSurveyMessage({ text: '', type: '' });

        if (!isLoggedIn) {
            if (typeof openModal === 'function') openModal('auth-gate');
            return;
        }

        // 🔒 CHECK VALIDATION: Ensures all fields, exactly 3 issues, and both commentary textboxes are filled
        if (!trumpGrade || !congressGrade || !gopGrade || !demGrade || !presidentMessage.trim() || !economyRating || selectedIssues.length !== 3 || !personalReason.trim()) {
            return setSurveyMessage({ text: '❌ Please complete all questions and fill out both text comments to cast your vote.', type: 'error' });
        }

        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        try {
            // Fires choice packet payload arrays to your secure database ledger port
            const res = await fetch(`${baseUrl}/api/vote/cast-ballot-multi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: sessionStorage.getItem('currentUserId'),
                    votes: [
                        { issueId: 101, voteChoice: trumpGrade },     
                        { issueId: 102, voteChoice: congressGrade },  
                        { issueId: 103, voteChoice: gopGrade },       
                        { issueId: 104, voteChoice: demGrade },       
                        { issueId: 105, voteChoice: presidentMessage.trim() },
                        { issueId: 106, voteChoice: economyRating },
                        { issueId: 107, voteChoice: selectedIssues.join(', ') },
                        { issueId: 108, voteChoice: personalReason.trim() } // 📝 Saves personal statement string row
                    ]
                })
            });
            const data = await res.json();

            if (!res.ok) {
                return setSurveyMessage({ text: data.error || '❌ Ballot ledger submission failure.', type: 'error' });
            }

            setSurveyMessage({ text: '🎉 Secure ballots recorded successfully! Thank you for participating.', type: 'success' });
        } catch (error) {
            console.error('Survey transmission failure:', error);
            setSurveyMessage({ text: '❌ Local pipeline error. Ensure backend server is operational on port 5000.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="survey-page-container" style={{ width: '100%', boxSizing: 'border-box' }}>
            <div className="survey-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                <h2>Civic Assessment Survey</h2>
                
                {surveyMessage.text && (
                    <div className={`auth-alert-banner ${surveyMessage.type}`} style={{ textAlign: 'center' }}>
                        {surveyMessage.text}
                    </div>
                )}

                <form onSubmit={handleCastBallotSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
                    
                    {/* ==========================================
                       🗳️ QUESTION 1: PRESIDENT TRUMP EVALUATION
                       ========================================== */}
                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">
                            How would you grade President Trump?
                        </p>

                        <div className="survey-grades-row">
                            {letterGrades.map((grade) => (
                                <div 
                                    key={`trump-${grade}`}
                                    onClick={() => !isSubmitting && setTrumpGrade(grade)}
                                    className={`survey-box-option ${trumpGrade === grade ? 'selected-box' : ''}`}
                                >
                                    {grade}
                                </div>
                            ))}
                        </div>

                        <div className="unsure-wrapper-row">
                            <div 
                                onClick={() => !isSubmitting && setTrumpGrade('Unsure')}
                                className={`survey-box-option ${trumpGrade === 'Unsure' ? 'selected-box' : ''}`}
                            >
                                Unsure
                            </div>
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 2: US CONGRESS EVALUATION
                       ========================================== */}
                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">
                            How would you grade Congress?
                        </p>

                        <div className="survey-grades-row">
                            {letterGrades.map((grade) => (
                                <div 
                                    key={`congress-${grade}`}
                                    onClick={() => !isSubmitting && setCongressGrade(grade)}
                                    className={`survey-box-option ${congressGrade === grade ? 'selected-box' : ''}`}
                                >
                                    {grade}
                                </div>
                            ))}
                        </div>

                        <div className="unsure-wrapper-row">
                            <div 
                                onClick={() => !isSubmitting && setCongressGrade('Unsure')}
                                className={`survey-box-option ${congressGrade === 'Unsure' ? 'selected-box' : ''}`}
                            >
                                Unsure
                            </div>
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 3: REPUBLICAN PARTY EVALUATION
                       ========================================== */}
                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">
                            How would you grade the Republican Party?
                        </p>

                        <div className="survey-grades-row">
                            {letterGrades.map((grade) => (
                                <div 
                                    key={`gop-${grade}`}
                                    onClick={() => !isSubmitting && setGopGrade(grade)}
                                    className={`survey-box-option ${gopGrade === grade ? 'selected-box' : ''}`}
                                >
                                    {grade}
                                </div>
                            ))}
                        </div>

                        <div className="unsure-wrapper-row">
                            <div 
                                onClick={() => !isSubmitting && setGopGrade('Unsure')}
                                className={`survey-box-option ${gopGrade === 'Unsure' ? 'selected-box' : ''}`}
                            >
                                Unsure
                            </div>
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 4: DEMOCRATIC PARTY EVALUATION
                       ========================================== */}
                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">
                            How would you grade the Democratic Party?
                        </p>

                        <div className="survey-grades-row">
                            {letterGrades.map((grade) => (
                                <div 
                                    key={`dem-${grade}`}
                                    onClick={() => !isSubmitting && setDemGrade(grade)}
                                    className={`survey-box-option ${demGrade === grade ? 'selected-box' : ''}`}
                                >
                                    {grade}
                                </div>
                            ))}
                        </div>

                        <div className="unsure-wrapper-row">
                            <div 
                                onClick={() => !isSubmitting && setDemGrade('Unsure')}
                                className={`survey-box-option ${demGrade === 'Unsure' ? 'selected-box' : ''}`}
                            >
                                Unsure
                            </div>
                        </div>
                    </div>
                    {/* ==========================================
                       📝 QUESTION 5: OPEN TEXT MESSAGE FIELD BOX
                       ========================================== */}
                    <div style={{ marginBottom: '40px', width: '100%', boxSizing: 'border-box' }}>
                        <p className="survey-question-prompt">
                            If you could say one thing directly to the President, face-to-face, what would it be?
                        </p>
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                className="survey-text-box"
                                placeholder="Type your message to the President here..."
                                value={presidentMessage}
                                onChange={(e) => setPresidentMessage(e.target.value)}
                                disabled={isSubmitting}
                                style={{ width: '100%', minHeight: '180px', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 6: CURRENT ECONOMY RATING
                       ========================================== */}
                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">
                            How would you rate the current economy?
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {economyOptions.map((option) => (
                                <div 
                                    key={`economy-${option}`}
                                    onClick={() => !isSubmitting && setEconomyRating(option)}
                                    className={`survey-box-option ${economyRating === option ? 'selected-box' : ''}`}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>

                        <div className="unsure-wrapper-row">
                            <div 
                                onClick={() => !isSubmitting && setEconomyRating('Unsure')}
                                className={`survey-box-option ${economyRating === 'Unsure' ? 'selected-box' : ''}`}
                            >
                                Unsure
                            </div>
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 7: 3-ISSUE SELECTION WRAP PANEL
                       ========================================== */}
                    <div style={{ marginBottom: '40px', width: '100%', boxSizing: 'border-box' }}>
                        <p className="survey-question-prompt">
                            Which three issues matter most to you? <span style={{ fontWeight: 'normal', fontSize: '14px', color: '#64748b' }}>(Select exactly 3)</span>
                        </p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                            {civicIssuesOptions.map((issue) => {
                                const isSelected = selectedIssues.includes(issue);
                                return (
                                    <div
                                        key={`issue-${issue}`}
                                        onClick={() => handleIssueToggleClick(issue)}
                                        className={`survey-box-option ${isSelected ? 'selected-box' : ''}`}
                                        style={{
                                            display: 'inline-flex',
                                            width: 'auto',
                                            minWidth: 'max-content',
                                            flex: '0 1 auto',
                                            padding: '10px 18px',
                                            fontSize: '14.5px',
                                            whiteSpace: 'nowrap',
                                            boxSizing: 'border-box',
                                            cursor: (!isSelected && selectedIssues.length >= 3) ? 'not-allowed' : 'pointer',
                                            opacity: (!isSelected && selectedIssues.length >= 3) ? 0.5 : 1
                                        }}
                                    >
                                        {issue}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ==========================================
                       📝 QUESTION 8: PERSONAL STATEMENT BOX
                       ========================================== */}
                    <div style={{ marginBottom: '30px', width: '100%', boxSizing: 'border-box' }}>
                        <p className="survey-question-prompt">
                            Why do these issues matter to you personally?
                        </p>
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                className="survey-text-box"
                                placeholder="Type your personal statement here..."
                                value={personalReason}
                                onChange={(e) => setPersonalReason(e.target.value)}
                                disabled={isSubmitting}
                                style={{ width: '100%', minHeight: '180px', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-survey-submit"
                        disabled={isSubmitting || !trumpGrade || !congressGrade || !gopGrade || !demGrade || !presidentMessage.trim() || !economyRating || selectedIssues.length !== 3 || !personalReason.trim()}
                    >
                        {isSubmitting ? 'Recording Ballots...' : 'Submit Secure Votes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
