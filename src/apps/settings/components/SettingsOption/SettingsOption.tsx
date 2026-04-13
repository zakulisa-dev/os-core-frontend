import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '@Features/i18n/types/language';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Background, Theme } from '@Features/settings/enums';

interface Props extends ChildrenNever {
  value: Background | Theme | Language;
  category: string;
}

const SettingsOption: FC<Props> = React.memo(({ value, category }: Props) => {
  const { t } = useTranslation('settings');

  return <option value={value}>{t(`${category}.${value}`)}</option>;
});

SettingsOption.displayName = 'SettingsOption';

export { SettingsOption };
