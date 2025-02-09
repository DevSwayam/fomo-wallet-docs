import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ArrowUpDown, Loader2 } from "lucide-react";

const LeaderboardTable = () => {
  const [sortConfig, setSortConfig] = React.useState({
    key: "score",
    direction: "desc",
  });
  const [apiData, setApiData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/analyze");
        const data = await response.json();
        setApiData(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setIsClient(true);
  }, []);

  const sortData = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "desc"
          ? "asc"
          : "desc",
    });
  };

  const formatDate = (timestamp) => {
    if (!isClient) return "...";
    return new Date(timestamp).toLocaleString();
  };

  const sortedData = React.useMemo(() => {
    if (!apiData?.leaderboard) return [];

    return [...apiData.leaderboard].sort((a, b) => {
      if (sortConfig.direction === "desc") {
        return b[sortConfig.key] - a[sortConfig.key];
      }
      return a[sortConfig.key] - b[sortConfig.key];
    });
  }, [apiData, sortConfig]);

  if (isLoading) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Username</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => sortData("score")}
              >
                Score <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => sortData("rank")}
              >
                Rank <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead>Latest Tweet</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((user, index) => (
              <TableRow key={user.username} className="hover:bg-gray-50">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">@{user.username}</TableCell>
                <TableCell>{user.score.toLocaleString()}</TableCell>
                <TableCell>{user.rank}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {user.requests[0]?.tweet || "-"}
                </TableCell>
                <TableCell suppressHydrationWarning>
                  {formatDate(user.lastUpdated)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="w-full flex justify-end mt-6 font-bold">
          <span className="text-sm font-mono" suppressHydrationWarning>
            Last Updated: {apiData ? formatDate(apiData.timestamp) : "..."}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;
