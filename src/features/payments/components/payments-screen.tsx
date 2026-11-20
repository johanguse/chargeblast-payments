"use client";
import { X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ExportIcon } from "@/components/icons/ui-icons";
import { downloadFile } from "@/lib/download";
import { paymentsToCsv } from "../domain/csv";
import type { Payment } from "../domain/payment";
import {
  clearFilters,
  hasActiveFilters,
  paginate,
  queryPayments,
  toggleSort,
} from "../domain/query";
import { useColumnLayout } from "../hooks/use-column-layout";
import { useNotice } from "../hooks/use-notice";
import { usePaymentsQuery } from "../hooks/use-payments-query";
import { AnalyzeDialog } from "./analyze-dialog";
import { AnnouncementBanner } from "./announcement-banner";
import { ColumnSettings } from "./column-settings";
import { FilterBar } from "./filters/filter-bar";
import { PageHeading, type TransactionTab } from "./page-heading";
import { Pagination } from "./pagination";
import { StatusTabs } from "./status-tabs";
import { PaymentsTable } from "./table/payments-table";
import { TopBar } from "./top-bar";

export function PaymentsScreen({
  now,
  data,
  loading = false,
  activeTab = "Payments",
}: {
  now: number;
  data: Payment[];
  loading?: boolean;
  activeTab?: TransactionTab;
}) {
  const { params, update, refreshing } = usePaymentsQuery();
  const layout = useColumnLayout();
  const [notice, setNotice] = useNotice();
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const statusTabs = useRef<HTMLDivElement>(null);

  const tableLoading = loading || refreshing;
  const result = useMemo(
    () => queryPayments(data, params, now),
    [data, params, now],
  );
  const showPayments = activeTab === "Payments" || activeTab === "All activity";
  const page = paginate(result, params);
  const reset = () => update(clearFilters);

  function exportRows() {
    downloadFile(
      paymentsToCsv(result),
      "payments.csv",
      "text/csv;charset=utf-8",
    );
    setNotice(`${result.length} payments exported`);
  }

  return (
    <>
      {tableLoading && (
        <span className="sr" role="status">
          Loading payments
        </span>
      )}
      <main
        id="main-content"
        tabIndex={-1}
        className="main payments-main"
        aria-busy={loading}
        inert={loading}
      >
        <TopBar
          search={params.get("q") || ""}
          onSearch={(value) =>
            update((p) => (value ? p.set("q", value) : p.delete("q")))
          }
        />
        <PageHeading
          activeTab={activeTab}
          onAnalyze={() => setAnalyzeOpen(true)}
        />
        {showPayments ? (
          <>
            <AnnouncementBanner
              onDismiss={() =>
                statusTabs.current?.querySelector("button")?.focus()
              }
            />
            <StatusTabs
              ref={statusTabs}
              selected={params.getAll("status")}
              onSelect={(status) =>
                update((p) => {
                  p.delete("status");
                  if (status !== "All") p.append("status", status);
                })
              }
            />
            <div className="filter-actions">
              <FilterBar params={params} update={update} />
              <div className="list-actions">
                <button
                  type="button"
                  className="outline"
                  onClick={exportRows}
                  aria-label="Export current view as CSV"
                >
                  <ExportIcon /> Export
                </button>
                <ColumnSettings layout={layout} />
              </div>
            </div>
            {hasActiveFilters(params) && (
              <button type="button" className="reset" onClick={reset}>
                Clear filters <X size={12} />
              </button>
            )}
            <PaymentsTable
              loading={tableLoading}
              pageSize={page.size}
              rows={page.rows}
              columns={layout.visibleColumns}
              widths={layout.widths}
              wrap={layout.wrap}
              params={params}
              now={now}
              onSort={(column) => update((p) => toggleSort(p, column))}
              onResize={layout.resize}
              onMove={layout.move}
              announce={setNotice}
            />
            {!tableLoading && !result.length && (
              <section className="empty">
                <h2>No payments found</h2>
                <button type="button" onClick={reset}>
                  Clear search and filters
                </button>
              </section>
            )}
            <Pagination
              total={result.length}
              start={page.start}
              end={page.end}
              page={page.page}
              pages={page.pages}
              size={page.size}
              hidden={loading}
              onPageChange={(n) =>
                update((p) => p.set("page", String(n)), false)
              }
              onSizeChange={(n) => update((p) => p.set("size", String(n)))}
            />
          </>
        ) : (
          <section className="empty">
            <h2>No {activeTab.toLowerCase()} in this sandbox</h2>
          </section>
        )}
      </main>
      <AnalyzeDialog
        open={analyzeOpen}
        payments={showPayments ? result : []}
        onClose={() => setAnalyzeOpen(false)}
      />
      <div role="status" className={notice ? "toast" : "sr"}>
        {notice}
      </div>
    </>
  );
}
