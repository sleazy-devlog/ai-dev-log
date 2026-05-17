type ValidateLogFormInput = {
  title: string;
  todayWork: string;
};

export type LogFormValidationErrors = {
  titleError: string;
  todayWorkError: string;
};

export const validateLogForm = ({
  title,
  todayWork,
}: ValidateLogFormInput): LogFormValidationErrors => {
  return {
    titleError: title.trim() === "" ? "タイトルを入力してください" : "",
    todayWorkError:
      todayWork.trim() === "" ? "今日やったことを入力してください" : "",
  };
};
