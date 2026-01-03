export const mockVerificationResult = {
  trust_score: 0.68,
  status: "completed",
  results: {
    citations: [
      {
        id: 1,
        citation_text: "Smith et al. (2023)",
        status: "verified",
        confidence: 0.95,
        details: {
          doi: "10.1038/s41586-023-12345-6",
          title: "Artificial Intelligence and Hallucination Patterns in Large Language Models",
          authors: ["Smith, J.", "Anderson, K.", "Chen, L."],
          year: 2023,
          source: "Nature",
          url: "https://doi.org/10.1038/s41586-023-12345-6"
        }
      },
      {
        id: 2,
        citation_text: "Johnson (2024)",
        status: "fake",
        confidence: 0.92,
        details: {
          reason: "DOI not found in any database. No matching paper exists in CrossRef, PubMed, or Semantic Scholar.",
          searched_databases: ["CrossRef", "PubMed", "Semantic Scholar", "OpenAlex"]
        }
      },
      {
        id: 3,
        citation_text: "Nature Communications (DOI: 10.1038/example)",
        status: "suspicious",
        confidence: 0.78,
        details: {
          doi: "10.1038/example",
          reason: "DOI format is valid but the specific DOI does not resolve to any published paper.",
          note: "This appears to be a placeholder or example DOI"
        }
      },
      {
        id: 4,
        citation_text: "Chen and Lee (2023)",
        status: "verified",
        confidence: 0.88,
        details: {
          doi: "10.1145/3544548.3580857",
          title: "AI Reliability Challenges: A Comprehensive Study",
          authors: ["Chen, M.", "Lee, S."],
          year: 2023,
          source: "ACM Conference Proceedings",
          url: "https://doi.org/10.1145/3544548.3580857"
        }
      }
    ],
    facts: [
      {
        id: 1,
        claim: "35% of AI-generated citations are completely fabricated",
        verdict: "mixed",
        confidence: 0.72,
        evidence: [
          "A 2023 study found fabrication rates between 25-40% depending on the model",
          "Some research suggests rates as low as 15% for newer models",
          "The exact percentage varies significantly by use case"
        ],
        sources: [
          "AI Safety Research, 2023",
          "OpenAI Technical Report, 2024"
        ]
      },
      {
        id: 2,
        claim: "Verification systems can reduce hallucination rates by up to 60%",
        verdict: "true",
        confidence: 0.91,
        evidence: [
          "Multiple peer-reviewed studies confirm 50-70% reduction in hallucination rates",
          "Retrieval-augmented generation (RAG) systems show consistent improvements",
          "Independent verification across different model architectures"
        ],
        sources: [
          "Stanford AI Lab, 2023",
          "Nature Machine Intelligence, 2024",
          "arXiv:2023.12345"
        ]
      }
    ],
    links: [
      {
        id: 1,
        url: "https://example-research.com/ai-hallucinations",
        status: "broken",
        http_code: 404,
        details: {
          message: "Page not found",
          checked_at: new Date().toISOString(),
          archived: true,
          archive_url: "https://web.archive.org/web/20230101/example-research.com"
        }
      }
    ]
  },
  metadata: {
    total_citations: 4,
    verified_citations: 2,
    fake_citations: 1,
    suspicious_citations: 1,
    total_facts: 2,
    true_facts: 1,
    false_facts: 0,
    mixed_facts: 1,
    total_links: 1,
    working_links: 0,
    broken_links: 1,
    processing_time: 3.2,
    file_name: null,
    analyzed_at: new Date().toISOString()
  }
};