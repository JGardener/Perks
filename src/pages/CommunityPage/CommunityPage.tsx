import { ErrorBoundary } from "../../components/ErrorBoundary/ErrorBoundary";
import { StatsView } from "../../components/StatsView/StatsView";
import { useAppData } from "../../context/AppDataContext";
import { usePageTitle } from "../../hooks/usePageTitle";

export const CommunityPage = () => {
  usePageTitle("Community Tiers");
  const { perks, ratings, communityGrades } = useAppData();

  return (
    <ErrorBoundary label="Community">
      <StatsView perks={perks} ratings={ratings} communityGrades={communityGrades} />
    </ErrorBoundary>
  );
};
