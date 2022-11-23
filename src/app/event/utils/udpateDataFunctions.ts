import { builderTemplate } from '../components/page-builder/builderTemplate';
import { WorkflowList } from '../components/page-customizations/defaultPageData';
import { PageData, SectionData, WorkflowData } from '../interfaces/customPage';

export const updatePageCustomization = (workflowList: WorkflowData[]) => {
  /** Update the old workflow, page, section - name or label with new data */
  let newWorkflowList = workflowList.map((w: WorkflowData, wIndex: number) => {
    const newWF: WorkflowData = WorkflowList.find(
      (wf: any) => wf.workflow === w.workflow
    );
    if (newWF) {
      Object.keys(newWF)?.forEach((wField: string) => {
        /** Add workflow properties if the properties are not existing in the old workflow info */
        if (!w[wField]) {
          w[wField] = newWF[wField];
        }
        /** Update the workflow properties value if property's value are different and the property's field is not 'workflow' or 'pageList' */
        if (
          !(wField === 'workflow' || wField === 'pageList') &&
          w[wField] !== newWF[wField]
        ) {
          w[wField] = newWF[wField];
        }
      });

      /** pageList update */
      let pageList: PageData[] = Object.assign(w.pageList);
      pageList = pageList.map((p: PageData) => {
        const newPage: PageData = newWF.pageList?.find(
          (page: PageData) => page.name === p.name
        );
        if (newPage) {
          Object.keys(newPage).forEach((pField: string) => {
            /** Add page properties if the properties are not existing in the old page info */
            if (!p[pField]) {
              p[pField] = newPage[pField];
            }
            /** Update the page properties value if property's value are different and the property's field is not 'name' or 'sectionsList' */
            if (
              !(pField === 'name' || pField === 'sectionsList') &&
              p[pField] !== newPage[pField]
            ) {
              p[pField] = newPage[pField];
            }
          });

          /** sectionsList update */
          let sectionsList: SectionData[] = Object.assign(p.sectionsList);
          sectionsList = sectionsList.map((s: SectionData) => {
            const newSection: SectionData = newPage.sectionsList?.find(
              (section: SectionData) => section.name === s.name
            );
            if (newSection) {
              Object.keys(newSection).forEach((sField: string) => {
                /** Add section properties if the properties are not existing in the old section info */
                if (!s[sField]) {
                  s[sField] = newSection[sField];
                }
                /** Update the section properties value if property's value are different and the property's field is not 'name' or 'fieldsList' */
                if (
                  !(sField === 'name' || sField === 'fieldsList') &&
                  s[sField] !== newSection[sField]
                ) {
                  s[sField] = newSection[sField];
                }
              });
              return {
                ...s,
              };
            }
            return s;
          });

          /** Add the missing sections */
          newPage.sectionsList?.forEach(
            (section: SectionData, sIndex: number) => {
              if (
                !sectionsList.find((s: SectionData) => s.name === section.name)
              ) {
                sectionsList.splice(sIndex, 0, section);
              }
            }
          );
          return {
            ...p,
          };
        }
        return p;
      });

      /** Add the missing pages */
      newWF.pageList?.forEach((page: PageData, pIndex: number) => {
        if (!pageList.find((p: PageData) => p.name === page.name)) {
          pageList.splice(pIndex, 0, page);
        }
      });
      return {
        ...w,
        pageList,
      };
    }
    return w;
  });

  /** Add the missing workflows */
  WorkflowList?.forEach((wf: WorkflowData, wIndex: number) => {
    if (
      !newWorkflowList.find((w: WorkflowData) => w.workflow === wf.workflow)
    ) {
      newWorkflowList.splice(wIndex, 0, wf);
    }
  });

  return newWorkflowList;
};

export const updatePageTemplates = (templateList: any[]) => {
  /** Update the existing template fields */
  let newBuilderTemplate = templateList.map((temp: any) => {
    let sameTemp: any = null;
    let newTemp: any = Object.assign(temp);
    if (temp.templateId) {
      sameTemp = builderTemplate.find(
        (template: any) => template.templateId === temp.templateId
      );
    } else {
      sameTemp = builderTemplate.find(
        (template: any) =>
          template.json === temp.json &&
          template.templateName === temp.templateName
      );
    }
    if (sameTemp) {
      Object.keys(sameTemp).forEach((field: string) => {
        /** Add if the field is not existing in the old template */
        if (!temp[field]) {
          newTemp[field] = sameTemp[field];
        }
        /** Update the template field value if the value differs and the field is not 'checked' or 'pages' */
        if (
          !(field === 'checked' || field === 'pages') &&
          newTemp[field] !== sameTemp[field]
        ) {
          newTemp[field] = sameTemp[field];
        }
      });
    }
    return newTemp;
  });

  /** Add new template to the builderTempalte */
  builderTemplate.forEach((template: any, index: number) => {
    if (
      !newBuilderTemplate.find(
        (temp: any) =>
          temp.templateId === template.templateId &&
          temp.json === template.json &&
          temp.templateName === template.templateName
      )
    ) {
      newBuilderTemplate.splice(index, 0, template);
    }
  });

  return newBuilderTemplate;
};

export const isJSON = (text) => {
  if (typeof text !== 'string') {
    return false;
  }
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};
