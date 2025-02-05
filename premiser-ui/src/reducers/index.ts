import { combineReducers } from "@reduxjs/toolkit";
import { connectRouter } from "connected-react-router";
import { History } from "history";

import { app } from "../app/appSlice";
import auth from "./auth";
import autocompletes from "./autocompletes";
import editors from "./editors";
import entities from "./entities";
import errors from "./errors";
import privacyConsent from "./privacyConsent";
import { mainSearch } from "../components/mainSearchBox/mainSearchBoxSlice";
import { mainSearchPage } from "../pages/mainSearch/mainSearchPageSlice";
import { justificationsSearchPage } from "@/pages/justificationsSearch/justificationsSearchPageSlice";
import { mediaExcerptsSearchPage } from "@/pages/mediaExcerptsSearch/mediaExcerptsSearchPageSlice";
import { tagPage } from "@/pages/tag/tagPageSlice";
import { persorgPage } from "@/pages/persorg/persorgPageSlice";
import { sourcePage } from "@/pages/source/sourcePageSlice";
import { mediaExcerptPage } from "@/pages/mediaExcerpt/mediaExcerptPageSlice";
import { createAppearancePage } from "@/pages/appearances/createAppearancePageSlice";
import { justificationsPage } from "@/pages/justifications/justificationsPageSlice";
import { accountSettingsPage } from "@/pages/accountSettings/accountSettingsPageSlice";
import { propositionUsagesPage } from "@/pages/propositionUsages/propositionUsagesPageSlice";
import { mediaExcerptUsages } from "@/pages/mediaExcerpt/mediaExcerptUsagesSlice";
import { registrationConfirmationPage } from "@/pages/registration/registrationConfirmationPageSlice";
import { primaryContextTrail } from "@/components/contextTrail/primaryContextTrailSlice";
import { urlLocatorsEditorFields } from "@/editors/urlLocatorsEditorFieldsSlice";
import { factCheckPage } from "@/pages/factChecks/factCheckPageSlice";
import { passwordResetRequestPage } from "@/pages/passwordResetRequest/passwordResetRequestPageSlice";
import { passwordResetConfirmationPage } from "@/pages/passwordResetConfirmation/passwordResetConfirmationPageSlice";
import { propositionAppearancesDialog } from "@/components/propositionAppearancesDialog/propositionAppearancesDialogSlice";
import { mediaExcerptApparitionsDialog } from "@/components/mediaExcerptApparitionsDialog/mediaExcerptApparitionsDialogSlice";
import listEntities from "@/components/listEntities/listEntitiesReducer";

const widgets = combineReducers({
  listEntities,
});

export default (history: History) =>
  combineReducers({
    accountSettingsPage,
    app,
    auth,
    autocompletes,
    createAppearancePage,
    editors,
    entities,
    errors,
    factCheckPage,
    justificationsPage,
    justificationsSearchPage,
    mainSearch,
    mainSearchPage,
    mediaExcerptPage,
    mediaExcerptsSearchPage,
    passwordResetConfirmationPage,
    passwordResetRequestPage,
    persorgPage,
    primaryContextTrail,
    privacyConsent,
    propositionAppearancesDialog,
    propositionUsagesPage,
    mediaExcerptApparitionsDialog,
    mediaExcerptUsages,
    registrationConfirmationPage,
    router: connectRouter(history),
    sourcePage,
    tagPage,
    urlLocatorsEditorFields,
    widgets,
  });
