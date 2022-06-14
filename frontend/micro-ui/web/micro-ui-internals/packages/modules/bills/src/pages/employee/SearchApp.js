
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PTSearchApplication from "../../components/Search";

const Search = ({ path }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [payload, setPayload] = useState({});

  function onSubmit(_data) {
    Digit.SessionStorage.set("BILL_SEARCH_APPLICATION_DETAIL", {
      serviceCategory: _data?.serviceCategory,
      consumerCode: _data?.consumerCode,
      billNumber: _data?.billNumber,
      mobileNumber: _data?.mobileNumber,
      offset: 0,
      limit: 10,
      sortBy: "commencementDate",
      sortOrder: "DESC",
    });

    const data = {
      ..._data,
    };

    setPayload(
      Object.keys(data)
        .filter((k) => data[k])
        .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key] : data[key] }), {})
    );
  }
  useEffect(() => {
    const storedPayload = Digit.SessionStorage.get("BILL_SEARCH_APPLICATION_DETAIL") || {};
    if (storedPayload) {
      const data = {
        ...storedPayload,
      };

      setPayload(
        Object.keys(data)
          .filter((k) => data[k])
          .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {})
      );
    }
  }, []);
  const config = {
    enabled: !!(payload && Object.keys(payload).length > 0),
  };

  const newObj = { ...payload };
  const service = payload?.serviceCategory;
  delete newObj.serviceCategory;
  const {
    isFetching,
    isLoading,
    isSuccess,
    count,
    isLoading: hookLoading,
    searchResponseKey,
    data: billsResp,
    searchFields,
    ...rest
  } = Digit.Hooks.useBillSearch({
    tenantId,
    filters: {
      ...newObj,
      url: service?.url,
      businesService: service?.businesService,
    },
    config: {},
  });


  return (
    <PTSearchApplication
      t={t}
      tenantId={tenantId}
      onSubmit={onSubmit}
      data={
        !isLoading && isSuccess
          ? billsResp?.Bills?.length > 0
            ? billsResp?.Bills?.map((obj) => ({
                ...obj,
              }))
            : { display: "ES_COMMON_NO_DATA" }
          : ""
      }
      count={billsResp?.Bills?.length}
    />
  );
};

export default Search;
