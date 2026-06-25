import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./services/crudAuth";
import { employeesApi } from "./services/crudEmployee";
import { partnersApi } from "./services/crudPartner";
import { universitiesApi } from "./services/crudUniversity";
import { leadsApi } from "./services/crudLead";
import { applicationsApi } from "./services/crudApplication";
import { dashboardApi } from "./services/crudDashboard";
import { travelApi } from "./services/crudTravel";
import { newsApi } from "./services/crudNews";
import { blogApi } from "./services/crudBlog";
import { assignmentsApi } from "./services/crudAssignment";
import { coursesApi } from "./services/crudCourse";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [partnersApi.reducerPath]: partnersApi.reducer,
    [universitiesApi.reducerPath]: universitiesApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [travelApi.reducerPath]: travelApi.reducer,
    [newsApi.reducerPath]: newsApi.reducer,
    [blogApi.reducerPath]: blogApi.reducer,
    [assignmentsApi.reducerPath]: assignmentsApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      employeesApi.middleware,
      partnersApi.middleware,
      universitiesApi.middleware,
      leadsApi.middleware,
      applicationsApi.middleware,
      dashboardApi.middleware,
      travelApi.middleware,
      newsApi.middleware,
      blogApi.middleware,
      assignmentsApi.middleware,
      coursesApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
