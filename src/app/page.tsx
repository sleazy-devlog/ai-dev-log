"use client";

import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Container,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
  Stack,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
} from "@mui/material";
import {
  createLog,
  deleteLog,
  fetchLogs as fetchLogsApi,
  updateLog,
  type LogPayload,
} from "@/lib/logsApi";
import {
  INITIAL_LOG_FORM_VALUES,
  INITIAL_TAG_INPUT,
} from "@/constants/logForm";
import { validateLogForm } from "@/utils/validateLogForm";
import type { Log, SortOrder } from "@/types/log";

const TITLE_MAX_LENGTH = 50;
const BODY_MAX_LENGTH = 1000;
const TAG_MAX_LENGTH = 20;
const TAG_MAX_COUNT = 5;
const DEFAULT_SORT_ORDER: SortOrder = "createdAtDesc";
const LOG_DISPLAY_STEP = 10;

const formatCreatedAt = (createdAt: string) => {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

const getCharacterCountText = (value: string, maxLength: number) =>
  `${value.length}/${maxLength}文字`;

type SearchControlsProps = {
  searchTitle: string;
  sortOrder: SortOrder;
  allTags: string[];
  activeTag: string | null;
  onSearchTitleChange: (value: string) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
  onSelectTag: (tag: string | null) => void;
  onResetFilters: () => void;
};

function SearchControls({
  searchTitle,
  sortOrder,
  allTags,
  activeTag,
  onSearchTitleChange,
  onSortOrderChange,
  onSelectTag,
  onResetFilters,
}: SearchControlsProps) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 1 }}>
      <Stack spacing={2}>
        <Typography variant="h6">
          検索
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" } }}
        >
          <TextField
            fullWidth
            label="タイトル検索"
            value={searchTitle}
            onChange={(e) => onSearchTitleChange(e.target.value)}
            placeholder="タイトルで検索"
          />

          <TextField
            select
            fullWidth
            label="並び替え"
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
            sx={{ maxWidth: { sm: 220 } }}
          >
            <MenuItem value="createdAtDesc">新しい順</MenuItem>
            <MenuItem value="createdAtAsc">古い順</MenuItem>
            <MenuItem value="titleAsc">タイトル昇順</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            onClick={onResetFilters}
            sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "center" } }}
          >
            リセット
          </Button>
        </Stack>

        {allTags.length > 0 && (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" color="text.secondary">
              タグで絞り込み
            </Typography>

            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
              <Chip
                label="すべて"
                color={activeTag === null ? "primary" : "default"}
                variant={activeTag === null ? "filled" : "outlined"}
                onClick={() => onSelectTag(null)}
              />

              {allTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  color={activeTag === tag ? "primary" : "default"}
                  variant={activeTag === tag ? "filled" : "outlined"}
                  onClick={() => onSelectTag(tag)}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

type LogFormProps = {
  formRef: RefObject<HTMLDivElement | null>;
  editingLogId: number | null;
  title: string;
  todayWork: string;
  aiUsage: string;
  problem: string;
  learning: string;
  tagInput: string;
  tags: string[];
  titleError: string;
  todayWorkError: string;
  tagError: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onTodayWorkChange: (value: string) => void;
  onAiUsageChange: (value: string) => void;
  onProblemChange: (value: string) => void;
  onLearningChange: (value: string) => void;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onDeleteTag: (tag: string) => void;
  onSubmit: () => void;
  onReset: () => void;
};

function LogForm({
  formRef,
  editingLogId,
  title,
  todayWork,
  aiUsage,
  problem,
  learning,
  tagInput,
  tags,
  titleError,
  todayWorkError,
  tagError,
  isSubmitting,
  onTitleChange,
  onTodayWorkChange,
  onAiUsageChange,
  onProblemChange,
  onLearningChange,
  onTagInputChange,
  onAddTag,
  onDeleteTag,
  onSubmit,
  onReset,
}: LogFormProps) {
  return (
    <Paper
      ref={formRef}
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, borderRadius: 1 }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={1}>
          <Typography variant="h6">
            ログ入力
          </Typography>

          {editingLogId !== null && (
            <Alert severity="info">
              編集中: {title}
            </Alert>
          )}
        </Stack>

        <TextField
          fullWidth
          label="タイトル"
          value={title}
          disabled={isSubmitting}
          onChange={(e) => onTitleChange(e.target.value)}
          error={titleError !== ""}
          helperText={titleError || getCharacterCountText(title, TITLE_MAX_LENGTH)}
          slotProps={{ htmlInput: { maxLength: TITLE_MAX_LENGTH } }}
        />

        <TextField
          fullWidth
          label="今日やったこと"
          multiline
          rows={4}
          value={todayWork}
          disabled={isSubmitting}
          onChange={(e) => onTodayWorkChange(e.target.value)}
          error={todayWorkError !== ""}
          helperText={todayWorkError || getCharacterCountText(todayWork, BODY_MAX_LENGTH)}
          slotProps={{ htmlInput: { maxLength: BODY_MAX_LENGTH } }}
        />

        <TextField
          fullWidth
          label="AIに聞いたこと"
          multiline
          rows={4}
          value={aiUsage}
          disabled={isSubmitting}
          onChange={(e) => onAiUsageChange(e.target.value)}
          helperText={getCharacterCountText(aiUsage, BODY_MAX_LENGTH)}
          slotProps={{ htmlInput: { maxLength: BODY_MAX_LENGTH } }}
        />

        <TextField
          fullWidth
          label="詰まったこと"
          multiline
          rows={4}
          value={problem}
          disabled={isSubmitting}
          onChange={(e) => onProblemChange(e.target.value)}
          helperText={getCharacterCountText(problem, BODY_MAX_LENGTH)}
          slotProps={{ htmlInput: { maxLength: BODY_MAX_LENGTH } }}
        />

        <TextField
          fullWidth
          label="学んだこと"
          multiline
          rows={4}
          value={learning}
          disabled={isSubmitting}
          onChange={(e) => onLearningChange(e.target.value)}
          helperText={getCharacterCountText(learning, BODY_MAX_LENGTH)}
          slotProps={{ htmlInput: { maxLength: BODY_MAX_LENGTH } }}
        />

        <TextField
          fullWidth
          label="タグ"
          value={tagInput}
          disabled={isSubmitting}
          onChange={(e) => onTagInputChange(e.target.value)}
          error={tagError !== ""}
          helperText={
            tagError ||
            `${getCharacterCountText(tagInput, TAG_MAX_LENGTH)}・最大${TAG_MAX_COUNT}個`
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onAddTag();
            }
          }}
        />

        {tags.length > 0 && (
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={isSubmitting ? undefined : () => onDeleteTag(tag)}
                variant="outlined"
              />
            ))}
          </Stack>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
            )}
            {editingLogId === null ? "保存" : "更新"}
          </Button>

          <Button variant="outlined" onClick={onReset} disabled={isSubmitting}>
            リセット
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

type LogCardProps = {
  log: Log;
  activeTag: string | null;
  isSubmitting: boolean;
  deletingLogId: number | null;
  onShowDetail: (log: Log) => void;
  onStartEdit: (log: Log) => void;
  onSelectTag: (tag: string) => void;
  onOpenDelete: (id: number) => void;
};

function LogCard({
  log,
  activeTag,
  isSubmitting,
  deletingLogId,
  onShowDetail,
  onStartEdit,
  onSelectTag,
  onOpenDelete,
}: LogCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {log.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {formatCreatedAt(log.createdAt)}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                今日やったこと
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                {log.todayWork}
              </Typography>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                AI活用
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                {log.aiUsage}
              </Typography>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                問題
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                {log.problem}
              </Typography>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                学び
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                {log.learning}
              </Typography>
            </Stack>

            {(log.tags ?? []).length > 0 && (
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {(log.tags ?? []).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    color={activeTag === tag ? "primary" : "default"}
                    onClick={() => onSelectTag(tag)}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardContent>
      <CardActions
        sx={{
          justifyContent: "flex-end",
          gap: 1,
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: 1,
          borderColor: "divider",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => onShowDetail(log)}
          disabled={isSubmitting || deletingLogId !== null}
        >
          詳細
        </Button>
        <Button
          variant="outlined"
          onClick={() => onStartEdit(log)}
          disabled={isSubmitting || deletingLogId !== null}
        >
          編集
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => onOpenDelete(log.id)}
          disabled={isSubmitting || deletingLogId !== null}
        >
          {deletingLogId === log.id && (
            <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
          )}
          削除
        </Button>
      </CardActions>
    </Card>
  );
}

type LogListProps = {
  isFetchingLogs: boolean;
  logsLength: number;
  visibleLogsLength: number;
  displayedLogs: Log[];
  canShowMoreLogs: boolean;
  activeTag: string | null;
  isSubmitting: boolean;
  deletingLogId: number | null;
  onShowDetail: (log: Log) => void;
  onStartEdit: (log: Log) => void;
  onSelectTag: (tag: string) => void;
  onOpenDelete: (id: number) => void;
  onShowMore: () => void;
};

function LogList({
  isFetchingLogs,
  logsLength,
  visibleLogsLength,
  displayedLogs,
  canShowMoreLogs,
  activeTag,
  isSubmitting,
  deletingLogId,
  onShowDetail,
  onStartEdit,
  onSelectTag,
  onOpenDelete,
  onShowMore,
}: LogListProps) {
  return (
    <Stack spacing={2.5} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        ログ一覧
      </Typography>

      {isFetchingLogs && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            読み込み中...
          </Typography>
        </Stack>
      )}

      {!isFetchingLogs && logsLength === 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
          <Typography color="text.secondary">
            まだログがありません
          </Typography>
        </Paper>
      )}

      {!isFetchingLogs && logsLength > 0 && visibleLogsLength === 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
          <Typography color="text.secondary">
            条件に一致するログがありません
          </Typography>
        </Paper>
      )}

      {!isFetchingLogs && displayedLogs.map((log) => (
        <LogCard
          key={log.id}
          log={log}
          activeTag={activeTag}
          isSubmitting={isSubmitting}
          deletingLogId={deletingLogId}
          onShowDetail={onShowDetail}
          onStartEdit={onStartEdit}
          onSelectTag={onSelectTag}
          onOpenDelete={onOpenDelete}
        />
      ))}

      {!isFetchingLogs && canShowMoreLogs && (
        <Button
          variant="outlined"
          onClick={onShowMore}
          sx={{ alignSelf: "center", minWidth: 160 }}
        >
          もっと見る
        </Button>
      )}
    </Stack>
  );
}

export default function Home() {
  const [title, setTitle] = useState(INITIAL_LOG_FORM_VALUES.title);
  const [todayWork, setTodayWork] = useState(INITIAL_LOG_FORM_VALUES.todayWork);
  const [aiUsage, setAiUsage] = useState(INITIAL_LOG_FORM_VALUES.aiUsage);
  const [problem, setProblem] = useState(INITIAL_LOG_FORM_VALUES.problem);
  const [learning, setLearning] = useState(INITIAL_LOG_FORM_VALUES.learning);
  const [tagInput, setTagInput] = useState(INITIAL_TAG_INPUT);
  const [tags, setTags] = useState<string[]>([...INITIAL_LOG_FORM_VALUES.tags]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [titleError, setTitleError] = useState("");
  const [todayWorkError, setTodayWorkError] = useState("");
  const [tagError, setTagError] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [detailLog, setDetailLog] = useState<Log | null>(null);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
  const [visibleLogCount, setVisibleLogCount] = useState(LOG_DISPLAY_STEP);
  const [isFetchingLogs, setIsFetchingLogs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const formRef = useRef<HTMLDivElement | null>(null);

  const fetchLogs = async () => {
    setIsFetchingLogs(true);

    try {
      const data = await fetchLogsApi();
      setLogs(data);
      setErrorMessage("");
    } catch {
      setErrorMessage("ログ取得に失敗しました");
      setSuccessMessage("");
    } finally {
      setIsFetchingLogs(false);
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchLogsApi();
        setLogs(data);
        setErrorMessage("");
      } catch {
        setErrorMessage("ログ取得に失敗しました");
        setSuccessMessage("");
      } finally {
        setIsFetchingLogs(false);
      }
    };

    void loadLogs();
  }, []);

  const resetForm = () => {
    setTitle(INITIAL_LOG_FORM_VALUES.title);
    setTodayWork(INITIAL_LOG_FORM_VALUES.todayWork);
    setAiUsage(INITIAL_LOG_FORM_VALUES.aiUsage);
    setProblem(INITIAL_LOG_FORM_VALUES.problem);
    setLearning(INITIAL_LOG_FORM_VALUES.learning);
    setTagInput(INITIAL_TAG_INPUT);
    setTags([...INITIAL_LOG_FORM_VALUES.tags]);
    setTitleError("");
    setTodayWorkError("");
    setTagError("");
    setEditingLogId(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    const { titleError: nextTitleError, todayWorkError: nextTodayWorkError } =
      validateLogForm({ title, todayWork });

    setTitleError(nextTitleError);
    setTodayWorkError(nextTodayWorkError);

    if (nextTitleError || nextTodayWorkError) {
      return;
    }

    const isEditing = editingLogId !== null;
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload: LogPayload = {
        title,
        todayWork,
        aiUsage,
        problem,
        learning,
        tags,
      };

      if (isEditing) {
        await updateLog(editingLogId, payload);
      } else {
        await createLog(payload);
      }

      await fetchLogs(); // ログを再取得して更新する

      resetForm();
      setSuccessMessage(isEditing ? "更新しました" : "保存しました");
    } catch {
      setErrorMessage(isEditing ? "更新に失敗しました" : "保存に失敗しました");
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  
  };

  const handleStartEdit = (log: Log) => {
    setEditingLogId(log.id);
    setTitle(log.title);
    setTodayWork(log.todayWork);
    setAiUsage(log.aiUsage);
    setProblem(log.problem);
    setLearning(log.learning);
    setTagInput(INITIAL_TAG_INPUT);
    setTags(log.tags ?? []);
    setTitleError("");
    setTodayWorkError("");
    setTagError("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setTitleError("");
  };

  const handleTodayWorkChange = (value: string) => {
    setTodayWork(value);
    setTodayWorkError("");
  };

  const handleTagInputChange = (value: string) => {
    if (value.length > TAG_MAX_LENGTH) {
      setTagError(`タグは${TAG_MAX_LENGTH}文字以内で入力してください`);
      return;
    }

    setTagInput(value);
    setTagError("");
  };

  const handleAddTag = () => {
    const nextTag = tagInput.trim();

    if (nextTag === "") {
      setTagError("");
      setTagInput(INITIAL_TAG_INPUT);
      return;
    }

    if (tags.includes(nextTag)) {
      setTagError("同じタグは追加できません");
      setTagInput(INITIAL_TAG_INPUT);
      return;
    }

    if (nextTag.length > TAG_MAX_LENGTH) {
      setTagError(`タグは${TAG_MAX_LENGTH}文字以内で入力してください`);
      return;
    }

    if (tags.length >= TAG_MAX_COUNT) {
      setTagError(`タグは最大${TAG_MAX_COUNT}個まで追加できます`);
      return;
    }

    setTags([...tags, nextTag]);
    setTagInput(INITIAL_TAG_INPUT);
    setTagError("");
  };

  const handleDeleteTag = (tag: string) => {
    setTags(tags.filter((currentTag) => currentTag !== tag));
    setTagError("");
  };

  const resetFilters = () => {
    setSearchTitle("");
    setSelectedTag(null);
    setSortOrder(DEFAULT_SORT_ORDER);
    setVisibleLogCount(LOG_DISPLAY_STEP);
  };

  const handleSearchTitleChange = (value: string) => {
    setSearchTitle(value);
    setVisibleLogCount(LOG_DISPLAY_STEP);
  };

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag(tag);
    setVisibleLogCount(LOG_DISPLAY_STEP);
  };

  const handleSortOrderChange = (nextSortOrder: SortOrder) => {
    setSortOrder(nextSortOrder);
    setVisibleLogCount(LOG_DISPLAY_STEP);
  };

  // 削除関数
  const handleDelete = async (id: number) => {
    setDeletingLogId(id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteLog(id);
  
      await fetchLogs();
      setErrorMessage("");
      setSuccessMessage("削除しました");
    } catch {
      setErrorMessage("削除に失敗しました");
      setSuccessMessage("");
    } finally {
      setDeletingLogId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) {
      return;
    }

    await handleDelete(deleteTargetId);
    setDeleteTargetId(null);
  };

  useEffect(() => {
    if (successMessage === "") {
      return;
    }

    const timerId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [successMessage]);

  const allTags = useMemo(() => {
    return Array.from(new Set(logs.flatMap((log) => log.tags ?? [])));
  }, [logs]);

  const activeTag =
    selectedTag !== null && allTags.includes(selectedTag) ? selectedTag : null;

  const filteredLogs = useMemo(() => {
    const normalizedSearchTitle = searchTitle.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesTag =
        activeTag === null || (log.tags ?? []).includes(activeTag);
      const matchesTitle =
        normalizedSearchTitle === "" ||
        log.title.toLowerCase().includes(normalizedSearchTitle);

      return matchesTag && matchesTitle;
    });
  }, [logs, activeTag, searchTitle]);

  const visibleLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      if (sortOrder === "createdAtAsc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (sortOrder === "titleAsc") {
        return a.title.localeCompare(b.title, "ja");
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredLogs, sortOrder]);

  const displayedLogs = useMemo(() => {
    return visibleLogs.slice(0, visibleLogCount);
  }, [visibleLogs, visibleLogCount]);

  const canShowMoreLogs = displayedLogs.length < visibleLogs.length;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 }, pb: 8 }}>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          AI Dev Log
        </Typography>

        {errorMessage !== "" && (
          <Alert severity="error" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        )}

        {successMessage !== "" && (
          <Alert severity="success" onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <SearchControls
          searchTitle={searchTitle}
          sortOrder={sortOrder}
          allTags={allTags}
          activeTag={activeTag}
          onSearchTitleChange={handleSearchTitleChange}
          onSortOrderChange={handleSortOrderChange}
          onSelectTag={handleSelectTag}
          onResetFilters={resetFilters}
        />

        <LogForm
          formRef={formRef}
          editingLogId={editingLogId}
          title={title}
          todayWork={todayWork}
          aiUsage={aiUsage}
          problem={problem}
          learning={learning}
          tagInput={tagInput}
          tags={tags}
          titleError={titleError}
          todayWorkError={todayWorkError}
          tagError={tagError}
          isSubmitting={isSubmitting}
          onTitleChange={handleTitleChange}
          onTodayWorkChange={handleTodayWorkChange}
          onAiUsageChange={setAiUsage}
          onProblemChange={setProblem}
          onLearningChange={setLearning}
          onTagInputChange={handleTagInputChange}
          onAddTag={handleAddTag}
          onDeleteTag={handleDeleteTag}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />

        <LogList
          isFetchingLogs={isFetchingLogs}
          logsLength={logs.length}
          visibleLogsLength={visibleLogs.length}
          displayedLogs={displayedLogs}
          canShowMoreLogs={canShowMoreLogs}
          activeTag={activeTag}
          isSubmitting={isSubmitting}
          deletingLogId={deletingLogId}
          onShowDetail={setDetailLog}
          onStartEdit={handleStartEdit}
          onSelectTag={handleSelectTag}
          onOpenDelete={setDeleteTargetId}
          onShowMore={() =>
            setVisibleLogCount((currentCount) => currentCount + LOG_DISPLAY_STEP)
          }
        />
      </Stack>

      <Dialog
        open={detailLog !== null}
        onClose={() => setDetailLog(null)}
        fullWidth
        maxWidth="sm"
      >
        {detailLog !== null && (
          <>
            <DialogTitle>{detailLog.title}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                <Typography variant="body2" color="text.secondary">
                  {formatCreatedAt(detailLog.createdAt)}
                </Typography>

                {(detailLog.tags ?? []).length > 0 && (
                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                    {(detailLog.tags ?? []).map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                )}

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    今日やったこと
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {detailLog.todayWork}
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    AI活用
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {detailLog.aiUsage}
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    問題
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {detailLog.problem}
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    学び
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {detailLog.learning}
                  </Typography>
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailLog(null)}>
                閉じる
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
      >
        <DialogTitle>ログ削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            本当に削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTargetId(null)}
            disabled={deletingLogId !== null}
          >
            キャンセル
          </Button>
          <Button
            color="error"
            onClick={handleConfirmDelete}
            disabled={deletingLogId !== null}
          >
            {deletingLogId !== null && (
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            )}
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
