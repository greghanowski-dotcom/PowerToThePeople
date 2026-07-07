// src/pages/Home.jsx
import React from 'react';

const Home = () => {
    return (
        <div style={{ textAlign: 'left', paddingLeft: '20px', paddingRight: '20px' }}>
            <div className="system-explanation">
                <h3>Our Mission</h3>
                <p>
                    We believe in a democratic process that is transparent, secure, and truly
                    representative of the people. Our platform was built to reclaim the voices
                    that have been drowned out by the current political climate.
                </p>

                <ul>
                    <li>
                        <strong>Countering Special Interests:</strong> We are deeply concerned by the
                        way billionaires and powerful special interest groups have effectively
                        bought out our elected representatives. This platform is designed to bypass
                        that influence by allowing citizens to speak directly on the issues, ensuring
                        that policy direction is driven by the majority of voters rather than the
                        highest bidder.
                    </li>
                    <br />
                    <li>
                        <strong>Beyond the "Vocal Minority":</strong> Traditional town halls and
                        public forums have become echo chambers that represent only the most
                        extreme or vocal minority, leaving the vast majority of citizens unheard.
                        We provide a space for quiet, thoughtful, and widespread participation,
                        capturing the true sentiment of the public.
                    </li>
                    <br />
                    <li>
                        <strong>Verification for Integrity:</strong> You are welcome to vote with
                        the confidence that the process is secure and authenticated.
                    </li>
                    <br />
                    <li>
                        <strong>Direct Advocacy:</strong> We take the raw, unfiltered data from
                        these polls and use it to hold representatives accountable, ensuring
                        they serve the people, not the corporate interests that fund them.
                    </li>
                </ul>
            </div>
            <h2><b>The Case for Direct Democracy: Why Government Ineffectiveness Demands a New Approach</b></h2>
            <p>
                For decades, citizens across the globe have expressed a growing sense of disillusionment with their
                governments. From gridlocked legislatures to policies that seem completely disconnected from the needs
                of the average voter, the perception that "government is ineffective" has become a pervasive
                sentiment in modern political discourse. To understand this, we must first examine the structural flaws
                of our current representative systems and then consider how direct voting on issues could catalyze a
                more responsive political future.
            </p>

            <h3><b>The Anatomy of Government Ineffectiveness</b></h3>
            <p>
                The frustration directed at government is rarely about a lack of effort; it is about a fundamental
                misalignment of incentives. Representative government, while intended to be a stabilizing force, often
                suffers from three major systemic ailments:
            </p>
            <ul>
                <li>
                    <b>The Agency Problem:</b> In a representative system, power is delegated to elected officials. However,
                    once in office, representatives often prioritize party loyalty, donor interests, or personal career longevity
                    over the explicit preferences of their constituents.
                </li>
                <li>
                    <b>Hyper-Partisanship and Gridlock:</b> Legislative bodies have become theaters for ideological performance.
                    Because political success is often measured by blocking the other side rather than achieving consensus,
                    common-sense solutions to complex problems are frequently discarded.
                </li>
                <li>
                    <b>The Information Gap:</b> Bureaucracies are designed to be stable, but they are also notoriously slow to adapt.
                    By the time a legislative committee drafts, debates, and passes a bill, the circumstances may have shifted.
                </li>
            </ul>

            <h3><b>The Case for Direct Democracy</b></h3>
            <p>
                If representative government creates a layer of middlemen between the people and the law, direct democracy aims
                to collapse that distance. When citizens vote directly on specific issues—through referendums, initiatives, or
                digital platforms—the political landscape shifts in profound ways.
            </p>

            <h4><b>1. Incentivizing Political Literacy</b></h4>
            <p>
                The greatest argument against direct democracy is that "citizens aren't qualified to decide." However, this ignores
                the democratic reality: when the stakes are high and the vote is real, people become informed.
            </p>

            <h4><b>2. Cutting Out the Special Interest Middleman</b></h4>
            <p>
                Direct democracy is the ultimate antidote to lobbying. It is difficult and expensive to lobby hundreds of thousands
                of voters to change their minds on a ballot initiative; it is significantly easier to lobby a handful of legislators.
            </p>

            <h4><b>3. True Accountability</b></h4>
            <p>
                With issue-based voting, accountability is granular. There is no hiding a policy behind a broader party platform;
                the policy stands or falls on its own merits.
            </p>

            <h3><b>Toward a Hybrid Future</b></h3>
            <p>
                Implementing direct democracy does not necessarily mean abolishing the legislative branch. Many proponents suggest a
                hybrid model: representatives handle day-to-day administration while consequential questions are put directly to the people.
            </p>

            <p>
                The technology to support this shift—secure voting, transparent issue-tracking platforms, and real-time public forums—already exists.
            </p>

            <p>
                <b>POWER TO THE PEOPLE!</b>
            </p>
        </div >
    );
};

export default Home;