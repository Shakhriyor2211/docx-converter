import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
DocumentEditorContainerComponent.Inject(Toolbar);

export default function WordEditor() {
  return (
    <div id="editor">
      <DocumentEditorContainerComponent
        id="container"
        height={"1000px"}
        serviceUrl="https://services.syncfusion.com/react/production/api/documenteditor/"
        enableToolbar={true}
      ></DocumentEditorContainerComponent>
    </div>
  );
}
