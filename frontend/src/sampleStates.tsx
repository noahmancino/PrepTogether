import type {AppState, Test} from "./Types.tsx";

const sampleTest: Test = {
  id: "1",
  name: "Reading Comprehension Sample Test",
  sections: [
    {
      passage: `The rise of remote work has significantly altered the landscape of urban economies. Prior to 2020, central business districts in major cities thrived on daily commuters who sustained nearby restaurants, retail shops, and service businesses. With the shift to hybrid and fully remote work arrangements, many city centers have experienced reduced foot traffic, leading to business closures and decreased demand for commercial real estate.

However, this transformation has benefited residential neighborhoods and suburbs, where remote workers now spend more time and money locally. Small businesses in these areas have seen increased patronage, and housing markets outside of urban cores have strengthened. Public transportation systems have had to adapt to irregular ridership patterns, often reducing service frequency or rethinking route structures.

Some economists argue that this redistribution of economic activity represents a more balanced urban development model, while others are concerned about the long-term viability of downtown areas that were designed around the daily influx of office workers. City planners are now exploring ways to repurpose commercial spaces and create more mixed-use developments that can thrive without depending entirely on a 9-to-5 commuter population.`,
      questions: [
        {
          stem: "Which of the following most accurately expresses the main point of the passage?",
          choices: [
            "The shift to remote work has led to a permanent decrease in demand for commercial real estate in urban areas.",
            "Urban economies are being reshaped due to the growing prevalence of remote work arrangements.",
            "Companies are saving money by closing offices and encouraging employees to work from home.",
            "Public transportation systems have become less relevant in the age of remote work.",
            "Remote work has had no significant impact on urban retail or transit patterns.",
          ],
          selectedChoice: undefined,
        },
        {
          stem: "According to the passage, which of the following has been a positive effect of increased remote work?",
          choices: [
            "Decreased property values in suburban areas",
            "Reduced need for city planners to develop new strategies",
            "Increased patronage for businesses in residential neighborhoods",
            "More efficient public transportation systems in urban centers",
            "Greater demand for commercial office space",
          ],
          selectedChoice: undefined,
        },
        {
          stem: "The author suggests that city planners are now:",
          choices: [
            "Opposing remote work policies",
            "Abandoning downtown development completely",
            "Focusing exclusively on improving public transportation",
            "Considering how to adapt commercial spaces for new purposes",
            "Encouraging businesses to require in-person attendance",
          ],
          selectedChoice: undefined,
        }
      ],
    },
    {
      passage: `Artificial intelligence has evolved rapidly in recent years, transforming from a niche academic pursuit into a technology with widespread practical applications. Machine learning algorithms now power everything from recommendation systems on streaming platforms to medical diagnostic tools and autonomous vehicles. This progression has been fueled by advances in computational power, the availability of massive datasets, and breakthroughs in neural network architectures.

Despite these advances, AI systems still face significant limitations. They excel at pattern recognition within their training parameters but often struggle with causality, abstract reasoning, and adapting to novel situations. What appears to be "intelligence" is frequently a sophisticated form of statistical analysis rather than true understanding or consciousness.

The societal implications of AI advancement are complex and multifaceted. While these technologies offer tremendous potential to increase productivity, enhance decision-making, and solve complex problems, they also raise concerns about job displacement, algorithmic bias, privacy, and security. Policymakers, technologists, and ethicists continue to debate how to harness AI's benefits while mitigating its risks.

As we move forward, the challenge will be developing AI systems that not only perform well technically but also align with human values and operate transparently. This may require new approaches to AI design that prioritize explainability, fairness, and human oversight.`,
      questions: [
        {
          stem: "What does the passage identify as a key limitation of current AI systems?",
          choices: [
            "Insufficient computational power",
            "Lack of available training data",
            "Difficulty with abstract reasoning and causality",
            "High cost of implementation",
            "Resistance from potential users",
          ],
          selectedChoice: undefined,
        },
        {
          stem: "Based on the passage, which of the following best describes the author's view of artificial intelligence?",
          choices: [
            "Enthusiastic about its unlimited potential",
            "Deeply concerned about its existential risks",
            "Balanced, recognizing both benefits and challenges",
            "Skeptical of its practical applications",
            "Focused primarily on its economic implications",
          ],
          selectedChoice: undefined,
        },
        {
          stem: "According to the passage, developing effective AI systems in the future will require:",
          choices: [
            "Completely autonomous decision-making capabilities",
            "Eliminating human oversight",
            "Focusing exclusively on technical performance",
            "Alignment with human values and transparency",
            "Limiting AI to specialized applications",
          ],
          selectedChoice: undefined,
        },
        {
          stem: "The passage suggests that the current capabilities of AI systems are best described as:",
          choices: [
            "True consciousness and understanding",
            "Sophisticated statistical analysis that resembles intelligence",
            "Primarily theoretical with few practical applications",
            "Limited to basic computational tasks",
            "Equivalent to human intelligence in most domains",
          ],
          selectedChoice: undefined,
        }
      ],
    },
    {
      passage: `The human microbiome—the vast collection of microorganisms that inhabit our bodies—has emerged as a critical factor in understanding health and disease. These microbial communities, particularly those in the gut, influence numerous physiological processes, including digestion, immune function, and even neurological activity. Recent research suggests that the composition of one's microbiome may affect everything from inflammatory conditions to mental health.

Our modern lifestyle has significantly altered our relationship with these microbial partners. Factors such as processed food consumption, widespread antibiotic use, urban living, and heightened hygiene practices have reduced both the diversity and abundance of our microbial communities compared to those of our ancestors or contemporary populations living more traditional lifestyles.

This disruption, termed "dysbiosis," has been associated with the rising prevalence of various conditions, including inflammatory bowel disease, allergies, autoimmune disorders, and metabolic syndromes. The connection appears bidirectional—the microbiome influences health outcomes, and health status affects microbial composition.

Scientists are now exploring therapeutic approaches that leverage the microbiome, from dietary interventions and probiotics to more targeted treatments like fecal microbiota transplantation. However, the complexity of these microbial ecosystems presents challenges, as individual responses to interventions vary considerably. The personalization of microbiome-based treatments remains a frontier in medical research, promising a new dimension of precision medicine.`,
      questions: [
        {
          stem: "Which of the following best expresses the central idea of the passage?",
          choices: [
            "Antibiotics have permanently damaged the human microbiome.",
            "The human microbiome plays a crucial role in health and may offer new therapeutic approaches.",
            "Fecal microbiota transplantation is the most effective treatment for gut disorders.",
            "Modern hygiene practices have eliminated beneficial bacteria from human environments.",
            "Traditional lifestyles are healthier than modern ones due to microbiome differences.",
          ],
          selectedChoice: undefined,
        },
        {
          stem: "According to the passage, which factor has NOT contributed to changes in the human microbiome?",
          choices: [
            "Consumption of processed foods",
            "Use of antibiotics",
            "Urban living environments",
            "Improved hygiene practices",
            "Genetic mutations in humans",
          ],
          selectedChoice: undefined,
        },
        {
          stem: "The author suggests that the relationship between the microbiome and health is:",
          choices: [
            "Unidirectional, with the microbiome determining health outcomes",
            "Largely theoretical and not yet proven",
            "Bidirectional, with each influencing the other",
            "Only relevant for digestive disorders",
            "Less important than genetic factors",
          ],
          selectedChoice: undefined,
        }
      ],
    }
  ],
};

export const multipleTestsEditingState: AppState = {
  tests: {
    "1": sampleTest,
    "2": {
      id: "2",
      name: "Science Assessment",
      sections: [
        {
          passage: "The process of photosynthesis begins when plants absorb sunlight through specialized cells called chloroplasts. These cells contain chlorophyll, a green pigment that captures light energy. This energy is then used to convert carbon dioxide and water into glucose and oxygen...",
          questions: [
            {
              stem: "What is the primary function of chlorophyll in photosynthesis?",
              choices: [
                "To absorb carbon dioxide",
                "To capture light energy",
                "To produce oxygen",
                "To transport glucose through the plant",
                "To split water molecules"
              ],
              selectedChoice: undefined
            },
            {
              stem: "Which of the following is NOT a product of photosynthesis?",
              choices: [
                "Glucose",
                "Oxygen",
                "Water",
                "ATP",
                "Carbohydrates"
              ],
              selectedChoice: undefined
            }
          ]
        }
      ]
    },
    "3": {
      id: "3",
      name: "Mathematics Test",
      sections: [
        {
          passage: "Consider the quadratic function f(x) = ax² + bx + c where a, b, and c are constants with a ≠ 0. The discriminant of this function is given by the formula b² - 4ac...",
          questions: [
            {
              stem: "What does the discriminant tell us about the roots of a quadratic equation?",
              choices: [
                "It determines whether the roots are real or complex",
                "It gives the sum of the roots",
                "It gives the product of the roots",
                "It determines whether the function has a maximum or minimum",
                "None of the above"
              ],
              selectedChoice: undefined
            }
          ]
        }
      ]
    }
  },
  activeTestId: "2",
  viewMode: "home",
  sessionInfo: {
    userId: "user-789",
    startTime: new Date().toISOString(),
    isAuthor: true
  }
};