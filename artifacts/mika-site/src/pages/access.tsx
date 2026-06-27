import React from "react";
import { useListAccessRequests, useGetAccessRequestSummary } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Download, Users, Mail, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Access() {
  const { data: requests, isLoading: isListLoading } = useListAccessRequests();
  const { data: summary, isLoading: isSummaryLoading } = useGetAccessRequestSummary();

  // Escape a value for CSV: quote when it contains a delimiter/quote/newline, and
  // neutralize spreadsheet formula injection by prefixing risky leading characters.
  const csvEscape = (value: unknown): string => {
    let s = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(s)) {
      s = "'" + s;
    }
    if (/[",\n\r]/.test(s)) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const handleExportCSV = () => {
    if (!requests || requests.length === 0) return;

    const headers = ["ID", "Email", "Date Joined"];
    const rows = requests.map(req => [
      req.id,
      req.email,
      format(new Date(req.createdAt), "yyyy-MM-dd HH:mm:ss")
    ]);

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map(row => row.map(csvEscape).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mika-access-requests-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-[#05070d] p-6 lg:p-12 font-sans selection:bg-[#1e6bff] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#1e6bff] transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to site
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
            <p className="text-gray-500 mt-1">Manage and export early access emails.</p>
          </div>
          
          <Button 
            onClick={handleExportCSV} 
            disabled={!requests || requests.length === 0}
            className="mika-accent-bg hover:bg-[#1a5fe6] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Signups</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{summary?.total || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Today</CardTitle>
              <Clock className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{summary?.today || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Latest Entry</CardTitle>
              <Mail className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="text-lg font-medium truncate" title={summary?.latestEmail || "None yet"}>
                  {summary?.latestEmail || "None yet"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-sm border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead className="text-right">Date Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isListLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : requests && requests.length > 0 ? (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium text-gray-500">#{req.id}</TableCell>
                      <TableCell className="font-medium">{req.email}</TableCell>
                      <TableCell className="text-right text-gray-500">
                        {format(new Date(req.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-gray-500">
                      No access requests yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

      </div>
    </main>
  );
}