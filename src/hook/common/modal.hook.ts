import { useMemo, useRef } from "react";
import { IModalFormValue, type IModalRequest } from "../../models/common/modal.model";
import { useModalStore } from "../../store/common/modal.store";

export const useModal = <T,>(key: string, defaultModal?: IModalRequest<T>) => {
  // Selector-scoped: subscribing to the whole store would re-render every
  // useModal consumer whenever any unrelated modal opened.
  const entry = useModalStore((s) => s.modals[key]) as IModalRequest<T> | undefined;
  const setModalAt = useModalStore((s) => s.setModal);
  const resetModalAt = useModalStore((s) => s.resetModal);
  const removeModalAt = useModalStore((s) => s.removeModal);

  // The fallback needs a stable identity — `defaultModal` is usually an inline
  // literal, and a fresh object each render would re-fire dependent effects.
  const fallbackRef = useRef<IModalRequest<T> | null>(null);
  if (fallbackRef.current === null) {
    fallbackRef.current = defaultModal ?? new IModalFormValue<T>();
  }

  const modal = entry ?? fallbackRef.current;

  return useMemo(
    () => ({
      modal,
      setModal: (value: IModalRequest<T>) => setModalAt<T>(key, value),
      openModal: (data?: T) => setModalAt<T>(key, { visible: true, data }),
      closeModal: () => resetModalAt(key),
      removeModal: () => removeModalAt(key),
    }),
    [modal, key, setModalAt, resetModalAt, removeModalAt],
  );
};
