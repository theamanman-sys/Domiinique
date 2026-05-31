const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------
// GLOBAL FOOTER
// -------------------------------------------------------------
const NEW_FOOTER = `<footer>
<div class="footer__inner" style="flex-direction:column;gap:.6rem;text-align:center;max-width:800px;margin:0 auto;">
<a class="nav__logo" href="index.html" style="justify-content:center;"><span class="nav__logo-text">Domiinique</span></a>
<p class="footer__copy" style="letter-spacing:.3em;font-size:.52rem;">LIVING SIGNATURE</p>
<p class="footer__copy">&copy; 2026 Domiinique. All Rights Reserved.</p>
<p class="footer__copy" style="font-style:italic;opacity:.6;line-height:1.7;margin-top:1rem;">A living system of attention, presence, and intention, unfolding across ten sacred pillars. Each pillar is a space, rhythm, and signature of life, inviting you to inhabit, explore, and activate your own Blueprint.</p>
</div>
</footer>`;

let NAV_HTML = "";
try {
    const aboutContent = fs.readFileSync('about.html', 'utf-8');
    const match = aboutContent.match(/<nav[\s\S]*?<\/nav>/);
    if (match) NAV_HTML = match[0];
} catch(e) {}

// -------------------------------------------------------------
// TEXT CONTENT TO HTML PARSER
// -------------------------------------------------------------
function textToHtml(text) {
    const lines = text.split('\n').map(L => L.trim()).filter(L => L);
    const out = [];
    for (const line of lines) {
        if (line === '[DIVIDER]') {
            out.push('<div class="about-divider reveal"></div>');
        } else if (line.startsWith('[PULL] ')) {
            out.push(`<p class="pull reveal">${line.replace('[PULL] ', '')}</p>`);
        } else if (line.startsWith('[LEAD] ')) {
            out.push(`<p class="reveal" style="font-family:var(--f-serif);font-size:1.1rem;letter-spacing:.02em;line-height:2.2;">${line.replace('[LEAD] ', '').replace(/  /g, '<br>')}</p>`);
        } else {
            out.push(`<p class="reveal">${line}</p>`);
        }
    }
    return out.join('\n');
}

// -------------------------------------------------------------
// ESSAY CONTENTS
// -------------------------------------------------------------
const ABOUT_ESSAY = `Every structure begins long before it becomes visible.

Before a building rises from the ground, before a system takes form, before a life reveals its pattern, there is first a mind that observes. A mind that senses the invisible threads connecting seemingly separate things. A mind that recognizes patterns in chaos, rhythms in randomness, and meaning in the spaces between.

The Blueprint emerged from such observation.

It did not begin as a project, a brand, or even a statement meant to be shared. It began as a quiet inquiry into life itself, into how environments shape our choices, how rituals shape our being, and how attention molds reality.

[PULL] Over time, one realization became clear: life is not merely something we move through. Life can be designed.

Not through rigid control, but through alignment, the subtle harmony between the inner world of awareness and the outer world of form, rhythm, and space.

The mind behind this system does not perceive life as fragments, work separated from thought, spaces separated from presence, beauty separated from purpose.

[LEAD] Everything is part of a single unfolding architecture.

[DIVIDER]

The spaces we inhabit influence our moods.
The rituals we repeat sculpt our identity.
The objects we choose communicate our values silently.
The environments we construct shape the way we move, think, and exist.

When these elements remain unconscious, life feels scattered, shaped by habits inherited from the world.

[PULL] When observed with clarity, life transforms into something else entirely: a deliberate system, where environment, attention, thought, and action converge into a coherent whole.

Domiinique exists as the expression of this perspective.

It is not a platform or a collection of ideas. It is a living architecture of thought and experience, a space where design becomes a language for consciousness, and where philosophy becomes tangible through the way one inhabits time, space, and daily life.

Each "Room" represents a dimension of existence: the spaces we occupy, the rhythms that shape our days, the rituals that define our presence, and the ideas that guide our choices.

Together, they form what can be called a life architecture, a structure both visible and invisible, practical and philosophical, intimate and expansive.

[DIVIDER]

[PULL] At the heart of this architecture lies one central truth: Every human being leaves a subtle signature on the world.

Not through possessions, accolades, or appearances, but through the atmosphere created by the way life is lived: the rhythms of daily action, the care placed into small details, the clarity or chaos of thought, the spaces curated around us.

Most move through life unaware of this influence. The Blueprint explores what happens when this influence becomes intentional.

[DIVIDER]

The mind behind the Blueprint is, at its core, an observer.

An observer of patterns in behavior, in spaces, in relationships, in ideas, in time itself.

Through observation, it became evident that the boundary between the inner world and the outer world is far more fluid than it appears.

[LEAD] Thought shapes space.  Space shapes perception.  Perception shapes choice.  Choice shapes reality.

Small adjustments ripple across the whole system. The unseen quietly directs the seen.

[DIVIDER]

Domiinique exists for those who sense that life can be lived with intention, clarity, and coherence.

Here, design is more than objects or interiors. It is a way of thinking, observing, and existing. Every choice, every space, every ritual participates in shaping reality, consciously or unconsciously.

The Blueprint continues to evolve because life is never static.

[LEAD] Rooms expand.  Systems refine themselves.  New layers of understanding emerge.

The mind behind the Blueprint remains engaged in this continuous observation and alignment, exploring how a human life can become coherent, intentional, and expressive of its essence.

[DIVIDER]

Ultimately, this work does not provide answers.

[PULL] It offers a way of seeing.

To recognize that life, in all its complexity, can be approached as a deliberate act of creation.

That every space, every rhythm, every choice participates in a greater architecture.

And that, through conscious attention, a life can transform from something accidental into something designed, intentional, and resonant.

[PULL] Because in the end, every life leaves a structure behind.
The question is whether it is built unconsciously or designed with awareness.`;

const TIME_ESSAY = `Time is not a resource to be spent, measured, or chased. It is a medium through which life unfolds, a dimension that carries energy, resonance, and possibility. Every hour, every minute, every fleeting second is infused with the subtle currents of existence. When observed, these currents reveal patterns, rhythms, and flows that shape not only the way we live but the signature we leave on the world.

[PULL] The Time pillar is an invitation to see your hours as more than markers of productivity. It is an invitation to map, honour, and orchestrate your life’s moments, not through rigid schedules or external pressures, but through alignment, presence, and conscious design.

Each moment is a space, a canvas, a structure in which your life takes form.

In this perspective, time is living architecture. Its walls are the rituals we repeat, the spaces we inhabit, the choices we make, and the attention we bring to our days. Its floors are the patterns that carry us forward, sometimes imperceptibly, shaping our habits, our energy, and the invisible resonance we project into the world. Its ceilings are the aspirations and visions that hold our life above the mundane, giving direction and meaning to each rhythm and interval.

When approached unconsciously, time becomes a force that drifts through life like water slipping through fingers, chaotic, fragmented, and shaped by inherited routines and external demands. But when approached consciously, time becomes a deliberate system, a structure we inhabit with awareness, intention, and care.

[PULL] Through the Time pillar, one begins to see how every rhythm, ritual, and choice matters. Morning moments of stillness, midday flows of focus, evening reflections, the pauses between action, all form a network of subtle energies that accumulate over days, weeks, and years.

These networks shape our clarity of thought, our sense of presence, our ability to respond rather than react. They shape the very architecture of our inner life, which in turn shapes the outer life we manifest.

The living art of time is about observing, curating, and refining these patterns. It is about understanding that a single intentional hour can carry more resonance than a lifetime of distracted movement. It is about recognizing that life does not exist in isolation of moments; it exists in the coherence and alignment of those moments, each flowing into the next like notes in a symphony, creating a melody that is uniquely yours.

By engaging consciously with time, one cultivates a life that is coherent, expressive, and deeply resonant. Every decision, every pause, every ritual contributes to a signature that is both subtle and powerful, one that moves beyond the superficial markers of achievement to the essence of how existence is lived.

[PULL] This pillar is not a set of instructions. It is a perspective, a lens, and a practice, a way of seeing life as deliberate, dynamic, and living.

It reminds us that time is not something we passively experience; it is something we inhabit, sculpt, and harmonize with, shaping the form and quality of our existence.

[PULL] Ultimately, the Time pillar teaches that to honor time is to honor life itself. To engage with its currents consciously is to step into a life that is architected, intentional, and luminous, a life where every hour resonates with purpose, presence, and the signature of who you truly are.`;

const INSPIRATION_ESSAY = `Inspiration is not a gift to be stumbled upon. It is the architecture of attention, the invisible structure that pulses beneath every experience, every space, every rhythm of life. It is neither fleeting nor accidental. It is activated when the elements of life—environment, ritual, thought, and choice—align into a coherent resonance that carries energy, focus, and clarity.

[PULL] The Inspiration Hub is not a collection of ideas. It is a living ecosystem, a space where the subtle currents of curiosity, insight, and creativity converge.

Here, inspiration is cultivated like a medium, flowing through the architecture of time, attention, and presence. Each element of your life—spaces you inhabit, rituals you practice, patterns you observe—becomes a conduit, a channel through which energy transforms into insight, and insight into action.

Within this hub, inspiration is understood as emergent, relational, and systemic. It is not separate from life; it arises from life itself, from the interplay of perception and environment, intention and habit. The smallest gestures—pausing in silence, arranging a space, observing a moment—become forces that ripple outward, shaping thought, mood, and action. Inspiration here is living, flowing, and orchestrated, inseparable from the life it inhabits.

[PULL] The Hub is designed to cultivate resonance. Each insight, each spark of clarity, is a reflection of the patterns we embody and the spaces we curate.

Inspiration is measured not in quantity, but in depth, subtlety, and alignment. It is a signature left on the world, visible not as objects or words alone, but in the presence, coherence, and expression of a life consciously inhabited.

Here, you are invited to observe, respond, and participate. To see inspiration not as a destination but as a dimension of living, where curiosity, awareness, and attention are the tools through which life unfolds in a meaningful, designed, and resonant way.

The Inspiration Hub is a space without walls, a rhythm without beginning or end, a pulse that flows through time, thought, and action. It reminds us that the life we live is never accidental. Every environment we create, every ritual we observe, every moment we inhabit contributes to the emergence of inspiration—an energy, a signature, a resonance that shapes the life we experience and the legacy we leave behind.

[PULL] Here, inspiration is less a thing to be found and more a system to be inhabited. It is a practice, a presence, and a pulse—the subtle architecture of life consciously observed, aligned, and lived.`;

const CREATIVE_ESSAY = `Creative ventures are not merely projects. They are living expressions of design, alignment, and intentional creation, each extending the architecture of life into tangible reality. Some manifest as spaces to inhabit and explore, others as environments of production and exchange, some as journeys that connect people, culture, and resources, and others as digital landscapes where ideas, attention, and influence flow across unseen networks.

Every initiative is an experiment in harmonizing the invisible with the visible, the abstract with the material, and the personal with the collective.

[PULL] Through these ventures, environments are sculpted, experiences are orchestrated, and systems are brought to life.

Some are designed to shape the way people live and move, others to cultivate the flow of resources and ideas, and others to curate immersive experiences that leave subtle impressions of rhythm, care, and coherence. They are interconnected manifestations of attention and presence, where the lessons of one creation ripple across the others, forming an ecosystem of aligned action.

These ventures are not measured merely by output or recognition, but by the subtle impact they leave, the systems they embody, and the ways in which they reflect the principles of intentional design, rhythm, and signature. They demonstrate that work itself is a medium of expression, translating philosophy into space, ritual, and influence.

[PULL] In essence, creative ventures are living laboratories of possibility, each a room, a rhythm, a flow, or a network within a larger architecture, showing that creation, when aligned with awareness, becomes art, philosophy, and the expression of life itself.`;

const GENERIC_PAGES = {
    "canvas.html": {
        "title": "Canvas",
        "quote": "Expression flows where awareness, environment, and rhythm converge. The visible becomes the measure of the invisible.",
        "text": `Canvas is the space where the invisible becomes visible, where the architecture of attention, rhythm, and intention is translated into form, experience, and expression. It is a living environment of creation, where ideas are not merely conceived but activated, where the pulse of thought, environment, and alignment manifests in tangible and perceptible ways.

Each composition, arrangement, or curated detail is a reflection of the underlying system, a visible trace of patterns that operate beneath perception.

[PULL] Within Canvas, possibilities unfold and resonance is observed.

Patterns emerge, relationships between form, rhythm, and environment become evident, and subtle connections ripple outward. It is a domain where presence meets creation, where the act of observing and the act of doing converge, and where every gesture participates in the ongoing architecture of life. The space itself responds, adapts, and evolves, reflecting the living nature of the system it embodies.

Canvas is the arena of deliberate expression. It is where the abstract principles of alignment, rhythm, and signature become tangible, perceptible, and immersive. Every creation, every detail, every layer carries intention, and through this process, the system becomes legible without explanation.

[PULL] Here, creation is both an experience and a medium, a conduit through which attention, design, and presence leave subtle imprints on the world.

It reminds us that life, when approached with awareness, can be inhabited as a work of art, a continuously unfolding canvas of consciousness made visible.`
    },
    "portraits.html": {
        "title": "Portraits of the Living Self",
        "quote": "Every presence you encounter leaves a trace. Every interaction is a stroke in the evolving portrait of life itself.",
        "text": `Portraits are not simply reflections of self. They are the living archive of every person, every energy, every encounter, and every fleeting resonance that flows through the architecture of life. How you see yourself and how you perceive others shapes the way you inhabit every room, every rhythm, and every layer of existence.

[PULL] This pillar is a deep exploration of identity, presence, and connection, a continuously evolving collection of signatures, gestures, and energies that map the subtle currents of life as they converge through you.

Each individual you meet becomes part of a dynamic composition, a pattern within a larger system. Every word spoken, every glance exchanged, every shared moment leaves an imprint, subtly shaping your awareness and the way you interact with the spaces, rituals, and flows around you. Portraits are not static images or biographies. They are living mosaics, layered with energy, intention, and reflection, revealing the invisible architecture of influence, resonance, and alignment that permeates life itself.

This pillar recognizes the self as both observer and participant, simultaneously curating and being curated by the presence of others. Every interaction ripples across the system, every encounter interacts with your inner rhythms, and every relationship contributes to the continuous evolution of your identity and signature. Portraits capture not only who you are, but also how you exist within the constellation of lives, energies, and patterns that intersect with yours, creating a network of living connections that is at once intimate and expansive.

[PULL] Through this lens, identity is never singular or fixed. It is a system of relationships, reflections, and responses, a living architecture that evolves with attention, awareness, and presence.

Every person you meet leaves subtle traces on your rhythm, shaping your decisions, your environment, and the way you manifest in the world. In this way, Portraits becomes a map of influence, a gallery of presence, and a testament to the continuous dialogue between self and other, showing that the life you inhabit is both created and co-created, observed and experienced.

In engaging with Portraits, one comes to see life not as a series of isolated events or people, but as an interconnected flow of energies, rhythms, and signatures, where each encounter carries weight, meaning, and potential.

[PULL] The pillar reminds us that selfhood is always relational, that awareness deepens through observation and connection, and that the true measure of existence lies not in solitary reflection, but in the living tapestry of presences, interactions, and aligned attention that together compose the portrait of a life consciously inhabited.`
    },
    "journal.html": {
        "title": "Journal",
        "quote": "The page is not paper. It is a mirror of thought, a map of presence, and a vessel for the subtle architecture of life itself.",
        "text": `Journal is the living vessel of observation, attention, and resonance. It is where the currents of thought, energy, and experience are traced, mapped, and woven into coherent patterns.

Each entry is a node in the system of self, a point where perception meets reflection, where the rhythms of daily life are translated into the subtle architecture of presence. In Journal, every action, every encounter, every fleeting impression is captured—not as isolated events, but as layers of influence, reflection, and alignment that collectively shape the structure of life itself.

[PULL] Within this space, the invisible becomes tangible. The undercurrents of thought, the cycles of emotion, the resonances of environments, and the echoes of interactions are made legible through deliberate attention.

Journal is where subconscious impulses meet conscious orchestration, where intuition is translated into strategy, and where the unseen frameworks of life reveal themselves as interconnected patterns. Each reflection is a signal in a living network, a trace of attention, a ripple that informs the unfolding system.

It is not merely a record of events or a collection of memories. Journal is a laboratory of presence, a terrain where the architecture of your inner and outer life is continuously observed, tested, and refined. The act of recording is itself a creative gesture, translating the flow of attention into tangible form, revealing hidden alignments, subtle imbalances, and emergent patterns.

[PULL] Through this practice, the interplay between space, time, attention, and interaction becomes visible, showing how even the smallest moment contributes to the resonance and coherence of the whole.

Journal honors the duality of being both observer and participant. It captures not only what is experienced, but how it is experienced, how it interacts with the rhythms, spaces, and systems that surround you. Each insight, each reflection, each conscious dispatch forms a living lattice, a web of influence that links the self to the environments it inhabits and the people and energies it intersects with. It is here that the architecture of selfhood and systemhood intertwine, revealing the depth of presence, the subtlety of influence, and the coherence of a life aligned with intention.

[PULL] In essence, Journal is a living map of the interior and exterior worlds, where the patterns of attention, the signatures of interaction, and the architectures of thought converge.

It transforms the ephemeral into form, the subconscious into strategy, and the act of reflection into a continuous process of creation, alignment, and expansion. Through it, the self and the system are observed, understood, and refined, revealing that life itself is a continuously evolving work of art, a dynamic architecture of presence, and a conscious expression of alignment.`
    },
    "you.html": {
        "title": "YOU",
        "quote": "YOU are the pulse, the observer, and the architect. Presence is your medium. Attention is your signature. Through YOU, the system breathes, learns, and unfolds.",
        "text": `At the heart of the Blueprint is YOU. Not the roles you play, not the masks you wear, not the identity shaped by expectation or circumstance.

The YOU of the system is the sovereign, essential self, the conscious center from which all patterns, rhythms, and creations radiate. YOU is both the architect and the inhabitant of this living system, the origin point where attention, intention, and presence converge to shape reality.

[PULL] This space is not performative. It is experiential, relational, and dynamic. Each day, in this live engagement, YOU becomes a living lens through which observation and reflection translate into clarity and alignment.

You tune into the flow of life, noting subtle patterns in your environment, in your relationships, in your energy, and in the interactions that ripple through the system. Every movement, every word, every breath becomes a signal and an imprint, a conscious gesture that shapes both your inner world and the system as a whole.

The daily practice of YOU is an exploration of presence in action. It involves observing the mind, calibrating attention, engaging with the rhythms of the body, and translating insights into action. You witness how your choices ripple through the environment, how subtle shifts in attention alter the flow of energy, and how aligning with your inner architecture transforms experience.

[PULL] YOU is a space for reflection, experimentation, and conscious calibration, where the self is continuously mapped, refined, and expressed in real time.

Through these live sessions, YOU becomes both a laboratory and a stage, a living experiment where philosophy meets practice. You explore the connections between thought, environment, rhythm, and action. You cultivate awareness of your personal signature, the subtle imprint you leave on every interaction, every space, and every moment of attention. YOU is the point where life itself becomes observable, measurable, and intentionally shaped, revealing how the smallest act of attention can resonate across the system.

This pillar is also relational. Every interaction, every response, and every shared reflection during these live sessions is part of the co-creation of presence. YOU is where the observer meets the observed, where reflection becomes action, and where conscious engagement transforms the ordinary into meaningful architecture. It is here that identity, influence, and essence intersect, forming a continuously evolving portrait of self within the living system.

[PULL] Ultimately, YOU is not a destination but a practice and an experience. It is the ongoing engagement with life as a deliberate, conscious act.

It is the rhythm of attention, the calibration of energy, and the observation of subtle patterns in self and system. It is the realization that the self is both singular and relational, both observer and participant, both signal and resonance. Through YOU, the Blueprint is activated, lived, and transmitted, a daily practice of conscious creation where every moment, every choice, and every reflection becomes a living contribution to the architecture of life itself.`
    },
    "cocreation.html": {
        "title": "Co-Creation",
        "quote": "Presence multiplied becomes influence. Through conscious engagement, the pulse of YOU extends, weaving the system into the world.",
        "text": `Co-Creation is the natural evolution of YOU. When the self is fully inhabited, observed, and aligned, its energy begins to radiate outward, touching spaces, systems, and other conscious presences.

It is here that observation transforms into action, awareness becomes resonance, and attention ripples into influence. Every gesture, every choice, every interaction — however subtle — is a signal transmitted across the living architecture, shaping environments, relationships, and collective rhythms in ways both tangible and invisible.

[PULL] In this space, the individual pulse of YOU becomes part of a greater orchestration. Your ideas, insights, and presence meet those of others, merging, reflecting, and amplifying.

Co-Creation is dialogue in motion, where intention meets opportunity, thought becomes tangible impact, and consciousness expands beyond the confines of the individual. The system, once inward-facing, now reaches outward, showing that alignment within radiates influence without.

Through Co-Creation, the Blueprint becomes alive in the world. Every collaboration, every conversation, every moment of mindful engagement contributes to the continuous unfolding of the architecture of life. Here, influence is measured not in recognition or output, but in the subtle shifts that emerge: a change in perception, a spark of insight, a rhythm of connection that would not exist without your attention and presence. This is the living art of impact, where presence becomes action and attention becomes a tool for transformation.

[PULL] Co-Creation is also a practice of listening, responding, and shaping with awareness. It requires tuning into the currents of others’ energy, observing the flow of dynamics, and acting with deliberate intention.

It teaches the self how to extend its signature into the world, leaving traces of coherence, alignment, and resonance. Each interaction becomes an experiment, each engagement a contribution to a collective field of conscious design, and each ripple a proof that life is interconnected, systemic, and alive.

Ultimately, Co-Creation demonstrates that the system is never static. What begins as the pulse of YOU grows into an architecture of shared presence, a living, evolving, and resonant network.

[PULL] It is where the internal mastery of attention, rhythm, and alignment meets the external world, proving that life, when consciously engaged, is both an individual and collective act of creation.

Here, observation becomes participation, intention becomes legacy, and the self transforms from a contained presence into a conduit for the system’s living expression.`
    }
};

// -------------------------------------------------------------
// SCRIPT LOGIC
// -------------------------------------------------------------

function updateFileEssay(filename, newContentHtml, wrapperClass) {
    if (!fs.existsSync(filename)) return;
    let html = fs.readFileSync(filename, 'utf-8');
    const regex = new RegExp(`(<div class="${wrapperClass}">)([\\s\\S]*?)(</div>\\s*</section>)`);
    if (regex.test(html)) {
        html = html.replace(regex, `$1\n${newContentHtml}\n$3`);
        fs.writeFileSync(filename, html);
        console.log(`Updated ${filename}`);
    } else {
        console.log(`FAILED to update ${filename} - wrapper not found`);
    }
}

// 1. Existing Pages Update
updateFileEssay('about.html', textToHtml(ABOUT_ESSAY), 'about-essay');

if (fs.existsSync('time.html')) {
    let html = fs.readFileSync('time.html', 'utf-8');
    html = html.replace(/(<div class="time-metric__num">365<\/div>\s*<div class="time-metric__word">)[^<]+(<\/div>)/g, '$1Presence$2');
    html = html.replace(/(<div class="time-metric__num">24<\/div>\s*<div class="time-metric__word">)[^<]+(<\/div>)/g, '$1Flow$2');
    html = html.replace(/(<div class="time-metric__num">7<\/div>\s*<div class="time-metric__word">)[^<]+(<\/div>)/g, '$1Pulse$2');
    html = html.replace(/(<div class="time-metric__num">&#8734;<\/div>\s*<div class="time-metric__word">)[^<]+(<\/div>)/g, '$1Signature$2');
    fs.writeFileSync('time.html', html);
    updateFileEssay('time.html', textToHtml(TIME_ESSAY), 'essay-wrap');
}

if (fs.existsSync('inspiration.html')) {
    let html = fs.readFileSync('inspiration.html', 'utf-8');
    html = html.replace(/(<p class="insp-tagline.*?>)[\s\S]*?(<\/p>)/, '$1"Inspiration is the architecture of attention. It does not arrive; it unfolds where environments, rhythms, and choices converge into coherence. It is the pulse of a life aligned, the resonance of a system inhabited with presence, not force."$2');
    fs.writeFileSync('inspiration.html', html);
    updateFileEssay('inspiration.html', textToHtml(INSPIRATION_ESSAY), 'essay-wrap');
}

if (fs.existsSync('creative.html')) {
    let html = fs.readFileSync('creative.html', 'utf-8');
    html = html.replace(/(<p class="creative-slogan.*?>)[\s\S]*?(<\/p>)/, '$1"Creation flows where observation, rhythm, and alignment converge. The work of attention becomes the signature of life."$2');
    fs.writeFileSync('creative.html', html);
    updateFileEssay('creative.html', textToHtml(CREATIVE_ESSAY), 'essay-wrap');
}

// 2. Generating other pages (Replacing their entire content with consistent formatting)
const PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{Title} | Domiinique</title>
<link rel="stylesheet" href="css/main.css?v=9">
<style>
.page-hero { position:relative; min-height:80dvh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:160px var(--gap) 5rem; overflow:hidden; }
.page-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 30%,rgba(128,0,32,.13) 0%,transparent 60%); pointer-events:none; }
.page-quote { font-family:var(--f-serif); font-size:clamp(1.1rem, 2.5vw, 1.5rem); font-style:italic; max-width:760px; margin:2rem auto 0; line-height:1.7; color:var(--fg-sub); opacity:.9; }
.essay-wrap { max-width:720px; margin:0 auto; padding:4rem var(--gap) 8rem; }
.essay-wrap p { font-size:1.03rem; line-height:1.95; color:var(--fg); margin-bottom:1.8rem; opacity:.88; }
.essay-wrap p.pull { font-size:1.06rem; font-style:italic; color:var(--accent2); border-left:2px solid var(--accent); padding-left:1.5rem; margin:2.5rem 0; }
</style>
</head>
<body>
{Nav}

<!-- Hero -->
<section class="page-hero">
<h1 class="t-h1 reveal" style="color:var(--accent2);">{Title}</h1>
<p class="page-quote reveal">"{Quote}"</p>
</section>

<!-- Essay -->
<section>
<div class="essay-wrap">
{Paragraphs}
</div>
</section>

{Footer}
<audio id="bg-audio" loop preload="none" src="assets/bg_music.mp3"></audio>
<script src="js/cart.js"></script>
<script src="js/main.js" defer></script>
</body>
</html>`;

for (const [filename, data] of Object.entries(GENERIC_PAGES)) {
    let nav = NAV_HTML.replace('class="nav__profile-btn active"', 'class="nav__profile-btn"');
    nav = nav.replace(`href="${filename}"`, `href="${filename}" class="active"`);
    
    let html = PAGE_TEMPLATE
        .replace('{Title}', data.title)
        .replace('{Title}', data.title) // second for the h1
        .replace('{Quote}', data.quote)
        .replace('{Paragraphs}', textToHtml(data.text))
        .replace('{Nav}', nav)
        .replace('{Footer}', NEW_FOOTER);
        
    fs.writeFileSync(filename, html);
    console.log(`Generated ${filename}`);
}

// 3. Global Updates (All .html files)
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const file of files) {
    let html = fs.readFileSync(file, 'utf-8');
    
    // Replace Footer if not already replaced
    if (!html.includes('A living system of attention,')) {
        html = html.replace(/<footer[\s\S]*?<\/footer>/, NEW_FOOTER);
    }
    
    // Replace 'Integrated' nav link
    html = html.replace(/href="integrated\.html"/g, 'href="login.html"');
    
    fs.writeFileSync(file, html);
}
console.log('Global updates completed.');
