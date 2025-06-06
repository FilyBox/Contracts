import { motion } from 'framer-motion';

import { Button } from '@documenso/ui/primitives/button';

export const SuggestedQueries = ({
  handleSuggestionClick,
}: {
  handleSuggestionClick: (suggestion: string) => void;
}) => {
  const suggestionQueries = [
    {
      desktop:
        'Lista de Contratos finalizados, solo el titulo, fecha de finalización, no null, ordenados por fecha de finalización de mas reciente a mas antiguo',
      mobile: 'Contratos finalizados',
    },
    // {
    //   desktop: "Compare unicorn valuations in the US vs China over time",
    //   mobile: "US vs China",
    // },
    // {
    //   desktop: "Countries with highest unicorn density",
    //   mobile: "Top countries",
    // },
    // {
    //   desktop:
    //     "Show the number of unicorns founded each year over the past two decades",
    //   mobile: "Yearly count",
    // },
    // {
    //   desktop: "Display the cumulative total valuation of unicorns over time",
    //   mobile: "Total value",
    // },
    // {
    //   desktop:
    //     "Compare the yearly funding amounts for fintech vs healthtech unicorns",
    //   mobile: "Fintech vs health",
    // },
    // {
    //   desktop: "Which cities have with most SaaS unicorns",
    //   mobile: "SaaS cities",
    // },
    // {
    //   desktop: "Show the countries with highest unicorn density",
    //   mobile: "Dense nations",
    // },
    // {
    //   desktop:
    //     "Show the number of unicorns (grouped by year) over the past decade",
    //   mobile: "Decade trend",
    // },
    // {
    //   desktop:
    //     "Compare the average valuation of AI companies vs. biotech companies",
    //   mobile: "AI vs biotech",
    // },
    // {
    //   desktop: "Investors with the most unicorns",
    //   mobile: "Top investors",
    // },
  ];

  return (
    <motion.div
      key="suggestions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto"
    >
      <h2 className="text-foreground mb-4 text-lg font-semibold sm:text-xl">Try these queries:</h2>
      <div className="flex flex-wrap gap-2">
        {suggestionQueries.map((suggestion, index) => (
          <Button
            key={index}
            className={index > 5 ? 'hidden sm:inline-block' : ''}
            type="button"
            variant="outline"
            onClick={() => handleSuggestionClick(suggestion.desktop)}
          >
            <span className="">{suggestion.mobile}</span>
            <span className="hidden">{suggestion.desktop}</span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
