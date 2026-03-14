const { getGeminiModel } = require("./geminiClient");

const tokenize = (value = "") =>
	String(value)
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter(Boolean);

const toEventText = (event) => [
	event.title,
	event.description,
	event.eventType,
	event.hostingClub,
	event.venue,
].join(" ");

const calculateInterestScore = (event, registeredEvents, studentDepartment) => {
	let score = 0;
	const eventTokens = new Set(tokenize(toEventText(event)));

	const historyTokens = new Set();
	registeredEvents.forEach((registeredEvent) => {
		tokenize(toEventText(registeredEvent)).forEach((token) => historyTokens.add(token));
	});

	historyTokens.forEach((token) => {
		if (eventTokens.has(token)) score += 3;
	});

	const dept = String(studentDepartment || "").toLowerCase();
	if (dept) {
		if (dept.includes("cse") || dept.includes("computer") || dept.includes("it")) {
			if (String(event.eventType || "").toLowerCase().includes("technical")) score += 15;
			if (tokenize(toEventText(event)).some((token) => ["ai", "coding", "hackathon", "robotics"].includes(token))) {
				score += 8;
			}
		}
		if (tokenize(toEventText(event)).some((token) => token === dept || token.includes(dept))) {
			score += 6;
		}
	}

	return score;
};

const buildPrompt = ({ studentDepartment, registeredEvents, rankedCandidates }) => {
	const registeredTitles = registeredEvents.length
		? registeredEvents.map((event) => event.title).join("\n")
		: "None yet";

	const availableEventLines = rankedCandidates
		.map((entry) => `${entry.event.title} | ${entry.event.eventType} | popularity: ${entry.popularityCount} | score: ${entry.hybridScore}`)
		.join("\n");

	return [
		"You are an AI event recommendation assistant.",
		"Return ONLY a JSON array of up to 5 event IDs in best-match order.",
		"",
		`Student Department: ${studentDepartment || "Not specified"}`,
		"",
		"Previously registered events:",
		registeredTitles,
		"",
		"Available events:",
		availableEventLines,
		"",
		"Recommend the most relevant events for this student.",
	].join("\n");
};

const parseRecommendedIds = (text) => {
	if (!text) return [];
	const trimmed = text.trim();

	try {
		const parsed = JSON.parse(trimmed);
		if (Array.isArray(parsed)) return parsed.map((item) => String(item));
	} catch (error) {
		// Fall through to regex extraction.
	}

	const match = trimmed.match(/\[[\s\S]*\]/);
	if (!match) return [];
	try {
		const parsed = JSON.parse(match[0]);
		if (Array.isArray(parsed)) return parsed.map((item) => String(item));
	} catch (error) {
		return [];
	}

	return [];
};

const getRecommendedEvents = async ({ studentDepartment, registeredEvents, candidateEvents, popularityMap }) => {
	if (!candidateEvents.length) return [];

	const maxPopularity = Math.max(
		1,
		...candidateEvents.map((event) => Number(popularityMap.get(String(event._id)) || 0))
	);

	const rankedCandidates = candidateEvents
		.map((event) => {
			const popularityCount = Number(popularityMap.get(String(event._id)) || 0);
			const popularityScore = Math.round((popularityCount / maxPopularity) * 40);
			const interestScore = calculateInterestScore(event, registeredEvents, studentDepartment);
			const hybridScore = interestScore + popularityScore;

			return {
				event,
				popularityCount,
				popularityScore,
				interestScore,
				hybridScore,
			};
		})
		.sort((a, b) => b.hybridScore - a.hybridScore)
		.slice(0, 15);

	let aiRankedIds = [];
	try {
		const model = getGeminiModel();
		const prompt = buildPrompt({
			studentDepartment,
			registeredEvents,
			rankedCandidates,
		});

		const result = await model.generateContent(prompt);
		aiRankedIds = parseRecommendedIds(result.response.text());
	} catch (error) {
		aiRankedIds = [];
	}

	if (aiRankedIds.length) {
		const rankById = new Map(aiRankedIds.map((id, index) => [String(id), index]));
		const aiOrdered = rankedCandidates
			.filter((entry) => rankById.has(String(entry.event._id)))
			.sort((a, b) => rankById.get(String(a.event._id)) - rankById.get(String(b.event._id)))
			.map((entry) => entry.event);

		const fallback = rankedCandidates
			.filter((entry) => !rankById.has(String(entry.event._id)))
			.map((entry) => entry.event);

		return [...aiOrdered, ...fallback].slice(0, 5);
	}

	return rankedCandidates.slice(0, 5).map((entry) => entry.event);
};

module.exports = { getRecommendedEvents };
