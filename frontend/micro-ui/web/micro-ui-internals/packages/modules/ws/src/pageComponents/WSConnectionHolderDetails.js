import { CardLabel, Dropdown, LabelFieldPair, TextInput, CardLabelError, CheckBox } from "@egovernments/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { stringReplaceAll, getPattern } from "../utils";
import * as func from "../utils";
import { useForm, Controller } from "react-hook-form";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const createConnectionHolderDetails = () => ({
  sameAsOwnerDetails: true,
  name: "",
  gender: "",
  mobileNumber: "",
  guardian: "",
  relationship: "",
  address: "",
  ownerType: "",
  documentId: "",
  documentType: "",
  file: "",
});


const WSConnectionHolderDetails = ({ config, onSelect, userType, formData, setError, formState, clearErrors }) => {

  const { t } = useTranslation();
  const { pathname } = useLocation();
  const filters = func.getQueryStringParams(location.search);
  const [connectionHolderDetails, setConnectionHolderDetails] = useState(formData?.ConnectionHolderDetails ? [formData?.ConnectionHolderDetails?.[0]] : [createConnectionHolderDetails()]);
  const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });
  const stateId = Digit.ULBService.getStateId();
  const [isErrors, setIsErrors] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(formData?.[config.key]?.fileStoreId || null);
  const [file, setFile] = useState(null);

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  let menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter(data => data.active).map((genderDetails) => {
      menu.push({ i18nKey: `COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });

  let dropdownData = [];
  const { data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Documents");
  const docs = Documentsob?.PropertyTax?.Documents;
  const specialProofIdentity = Array.isArray(docs) && docs.filter((doc) => doc.code.includes("SPECIALCATEGORYPROOF"));
  if (specialProofIdentity.length > 0) {
    dropdownData = specialProofIdentity[0]?.dropdownData;
    dropdownData.forEach((data) => {
      data.i18nKey = stringReplaceAll(data.code, ".", "_");
    });
    dropdownData = dropdownData?.filter((dropdown) => dropdown.parentValue.includes(connectionHolderDetails?.[0]?.ownerType));
    if (dropdownData.length == 1 && dropdownValue != dropdownData[0]) {
      setTypeOfDropdownValue(dropdownData[0]);
    }
  }

  const GuardianOptions = [
    { name: "HUSBAND", code: "HUSBAND", i18nKey: "COMMON_MASTERS_OWNERTYPE_HUSBAND" },
    { name: "Father", code: "FATHER", i18nKey: "COMMON_MASTERS_OWNERTYPE_FATHER" },
  ];

  const { data: Menu, isLoading: isSpecialcategoryLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "OwnerType");
  Menu ? Menu.sort((a, b) => a.name.localeCompare(b.name)) : "";

  useEffect(() => {
    const data = connectionHolderDetails.map((e) => {
      return e;
    });
    onSelect(config?.key, data);
  }, [connectionHolderDetails]);


  useEffect(() => {
    if (userType === "employee") {
      onSelect(config.key, { ...formData[config.key], ...connectionHolderDetails });
    }
  }, [connectionHolderDetails]);


  const commonProps = {
    focusIndex,
    connectionHolderDetails,
    setFocusIndex,
    formData,
    formState,
    t,
    setError,
    clearErrors,
    config,
    setConnectionHolderDetails,
    setIsErrors,
    isErrors,
    connectionHolderDetails,
    filters,
    menu,
    uploadedFile,
    setUploadedFile,
    file,
    setFile,
    dropdownData,
    GuardianOptions,
    Menu
  };

  return (
    <React.Fragment>
      {connectionHolderDetails.map((connectionHolderDetail, index) => (
        <ConnectionDetails key={connectionHolderDetail.key} index={index} connectionHolderDetail={connectionHolderDetail} {...commonProps} />
      ))}
    </React.Fragment>
  );
};

const ConnectionDetails = (_props) => {
  const {
    connectionHolderDetail,
    focusIndex,
    setFocusIndex,
    t,
    config,
    setError,
    clearErrors,
    formState,
    connectionHolderDetails,
    setIsErrors,
    isErrors,
    setConnectionHolderDetails,
    menu,
    GuardianOptions,
    Menu
  } = _props;

  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, trigger, getValues } = useForm();
  const formValue = watch();
  const { errors } = localFormState;

  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    if (Object.entries(formValue).length > 0) {
      const keys = Object.keys(formValue);
      const part = {};
      keys.forEach((key) => (part[key] = connectionHolderDetail[key]));
      if (!_.isEqual(formValue, part)) {
        let isErrorsFound = true;
        Object.keys(formValue).map(data => {
          if (!formValue[data] && isErrorsFound) {
            isErrorsFound = false
            setIsErrors(false);
          }
        });
        if (isErrorsFound) setIsErrors(true);
        let ob = [{ ...formValue }];
        setConnectionHolderDetails(ob);
        trigger();
      }
    }
  }, [formValue]);


  useEffect(() => {
    let isClear = true;
    Object.keys(connectionHolderDetails?.[0])?.map(data => {
      if (!connectionHolderDetails[0][data] && connectionHolderDetails[0][data] != false && isClear) isClear = false
    })
    if (connectionHolderDetails?.[0]?.sameAsOwnerDetails || (isClear && Object.keys(connectionHolderDetails?.[0])?.length > 1)) {
      clearErrors("ConnectionHolderDetails");
    } else {
      trigger();
    }
  }, [connectionHolderDetails]);


  useEffect(() => {
    if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) {
      setError(config.key, { type: errors });
    }
    else if (!Object.keys(errors).length && formState.errors[config.key] && isErrors) {
      clearErrors(config.key);
    }
  }, [errors]);

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  return (
    <div >
      <div className="field">
        <Controller
          control={control}
          name="sameAsOwnerDetails"
          defaultValue={connectionHolderDetail?.sameAsOwnerDetails}
          isMandatory={true}
          render={(props) => (
            <CheckBox
              label={t("WS_SAME_AS_PROPERTY_OWNERS")}
              name={"sameAsOwnerDetails"}
              autoFocus={focusIndex.index === connectionHolderDetail?.key && focusIndex.type === "sameAsOwnerDetails"}
              errorStyle={(localFormState.touched.sameAsOwnerDetails && errors?.sameAsOwnerDetails?.message) ? true : false}
              onChange={(e) => {
                props.onChange(e.target.checked);
                setFocusIndex({ index: connectionHolderDetail?.key, type: "sameAsOwnerDetails" });
              }}
              checked={connectionHolderDetails?.[0]?.sameAsOwnerDetails}
              style={{ paddingBottom: "10px", paddingTop: "3px" }}
              onBlur={props.onBlur}
            />
          )}
        />
      </div>

      {!connectionHolderDetails?.[0]?.sameAsOwnerDetails ? <div>

        <LabelFieldPair>
          <CardLabel style={{ marginTop: "-5px" }} className="card-label-smaller">{`${t("WS_OWN_DETAIL_NAME")}*:`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="name"
              defaultValue={connectionHolderDetail?.name}
              rules={{ validate: (e) => ((e && getPattern("Name").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")), required: t("REQUIRED_FIELD") }}
              isMandatory={true}
              render={(props) => (
                <TextInput
                  value={props.value}
                  autoFocus={focusIndex.index === connectionHolderDetail?.key && focusIndex.type === "name"}
                  errorStyle={(localFormState.touched.name && errors?.name?.message) ? true : false}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                    setFocusIndex({ index: connectionHolderDetail?.key, type: "name" });
                  }}
                  labelStyle={{ marginTop: "unset" }}
                  onBlur={props.onBlur}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.name ? errors?.name?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel style={{ marginTop: "-5px" }} style={{ marginTop: "-5px" }} className="card-label-smaller">{`${t("WS_CONN_HOLDER_OWN_DETAIL_GENDER_LABEL")}*:`}</CardLabel>
          <Controller
            control={control}
            name={"gender"}
            defaultValue={connectionHolderDetail?.gender}
            rules={{ required: t("REQUIRED_FIELD") }}
            isMandatory={true}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={getValues("gender")}
                disable={false}
                option={menu}
                errorStyle={(localFormState.touched.gender && errors?.gender?.message) ? true : false}
                select={(e) => {
                  props.onChange(e);
                }}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.gender ? errors?.gender?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel style={{ marginTop: "-5px" }} className="card-label-smaller">{`${t("CORE_COMMON_MOBILE_NUMBER")}*:`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="mobileNumber"
              defaultValue={connectionHolderDetail?.mobileNumber}
              rules={{ validate: (e) => ((e && getPattern("MobileNo").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")), required: t("REQUIRED_FIELD") }}
              type="number"
              isMandatory={true}
              render={(props) => (
                <TextInput
                  type="number"
                  value={props.value}
                  autoFocus={focusIndex.index === connectionHolderDetail?.key && focusIndex.type === "mobileNumber"}
                  errorStyle={(localFormState.touched.mobileNumber && errors?.mobileNumber?.message) ? true : false}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                    setFocusIndex({ index: connectionHolderDetail?.key, type: "mobileNumber" });
                  }}
                  labelStyle={{ marginTop: "unset" }}
                  onBlur={props.onBlur}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.mobileNumber ? errors?.mobileNumber?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel style={{ marginTop: "-5px" }} className="card-label-smaller">{`${t("WS_OWN_DETAIL_GUARDIAN_LABEL")}*:`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="guardian"
              defaultValue={connectionHolderDetail?.guardian}
              rules={{ validate: (e) => ((e && getPattern("Name").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")), required: t("REQUIRED_FIELD") }}
              isMandatory={true}
              render={(props) => (
                <TextInput
                  value={props.value}
                  autoFocus={focusIndex.index === connectionHolderDetail?.key && focusIndex.type === "guardian"}
                  errorStyle={(localFormState.touched.guardian && errors?.guardian?.message) ? true : false}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                    setFocusIndex({ index: connectionHolderDetail?.key, type: "guardian" });
                  }}
                  labelStyle={{ marginTop: "unset" }}
                  onBlur={props.onBlur}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.guardian ? errors?.guardian?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel style={{ marginTop: "-5px" }} style={{ marginTop: "-5px" }} className="card-label-smaller">{`${t("WS_CONN_HOLDER_OWN_DETAIL_RELATION_LABEL")}*:`}</CardLabel>
          <Controller
            control={control}
            name={"relationship"}
            defaultValue={connectionHolderDetail?.relationship}
            rules={{ required: t("REQUIRED_FIELD") }}
            isMandatory={true}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={getValues("relationship")}
                disable={false}
                option={GuardianOptions}
                errorStyle={(localFormState.touched.relationship && errors?.relationship?.message) ? true : false}
                select={(e) => {
                  props.onChange(e);
                }}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.relationship ? errors?.relationship?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel style={{ marginTop: "-5px" }} className="card-label-smaller">{`${t("WS_CORRESPONDANCE_ADDRESS_LABEL")}*:`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="address"
              defaultValue={connectionHolderDetail?.address}
              rules={{ validate: (e) => ((e && getPattern("Address").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")), required: t("REQUIRED_FIELD") }}
              isMandatory={true}
              render={(props) => (
                <TextInput
                  value={props.value}
                  autoFocus={focusIndex.index === connectionHolderDetail?.key && focusIndex.type === "address"}
                  errorStyle={(localFormState.touched.address && errors?.address?.message) ? true : false}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                    setFocusIndex({ index: connectionHolderDetail?.key, type: "address" });
                  }}
                  labelStyle={{ marginTop: "unset" }}
                  onBlur={props.onBlur}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.address ? errors?.address?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel style={{ marginTop: "-5px" }} style={{ marginTop: "-5px" }} className="card-label-smaller">{`${t("WS_CONN_HOLDER_OWN_DETAIL_RELATION_LABEL")}*:`}</CardLabel>
          <Controller
            control={control}
            name={"ownerType"}
            defaultValue={connectionHolderDetail?.ownerType}
            rules={{ required: t("REQUIRED_FIELD") }}
            isMandatory={true}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={getValues("ownerType")}
                disable={false}
                option={Menu}
                errorStyle={(localFormState.touched.ownerType && errors?.ownerType?.message) ? true : false}
                select={(e) => {
                  props.onChange(e);
                }}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.ownerType ? errors?.ownerType?.message : ""}</CardLabelError>
      </div> : null}
    </div>
  );
};

export default WSConnectionHolderDetails;