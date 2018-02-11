
// List of Workflows on left side of workspace
var workflows = []

// When document is fully loaded
$(document).ready(function () {
    console.log("document ready");

    // clear the blue highlight from the selected list item under workflows
    // and set the new one selected
    $(".list-group").on('click', 'li', function() {
        console.log('Clear active state');
        $(".list-group li").removeClass('active');
        $(this).addClass('active');
        hideAllAttributes();
    });

    // workflow creation modal, when hiding, clear text entry field
    $(".modal#newWorkspace").on("hidden.bs.modal", function(){
        console.log('Hiding modal');
        var modal = $(this);
        modal.find('.modal-body input').val("");
    });

    hideAllAttributes();
    GetWorkflows();

})


// Create the center workspace area
function loadWorkflow(name, uuid) {
    workspace = document.getElementById('workspace');

    var h = document.getElementById('headerPlaceholder');
    if (h != null) {
        // Clear out all child elements for new workspace
        while (h.firstChild) {
            h.removeChild(h.firstChild);
        }
    }

    header = document.createElement("H1");
    header.id = 'workspaceHeader';

    header.appendChild(document.createTextNode(name))
    h.appendChild(header);

    workspace.className += " activeWorkspace";

    // Prep left side of workspace
    clearInputSpace();
    createInputHeader();
    createInputSection(uuid);

    // Prep right side of workspace
    clearOutputSpace();
    createOutputHeader();
    createOutputSection(uuid);

    $('#workspace').removeClass('hidden');
}

//function getComponentsFromServer() {
//    var action = new XMLHttpRequest();
//
//    action.onreadystatechange = function() {
//        if (this.readyState == 4 && this.status == 200) {
//            console.log(this.responseText);
//            var results = JSON.parse(this.responseText);
//            console.log(results);
//       }
//    };
//    action.open('GET', '/components');
//}

function sendComponentToServer(componentType, uuid)  {
    var action = new XMLHttpRequest();

    action.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var results = JSON.parse(this.responseText);
            console.log(results);
            if (results[0]['direction']=='from') {
                $('#workButtonInput').attr('id', results[0]['job_id']);
            }
            if (results[0]['direction']=='to') {
                $('#workButtonOutput').attr('id', results[0]['job_id']);
            }
            updateComponents(componentType);
       }
    };
    action.open('POST', '/components');
    action.send(JSON.stringify({ component: componentType, uuid: uuid}));
}

function updateComponents(componentType) {
    /* TODO: make this dynamic */
    if(componentType == 'docker') {
        $('#modalPlaceholder').load('/dockerlogin?job=' + $('.inputComponent > a').attr('id'));
    }
}

// User has selected a 'Connect from' component
function AddInputComponent(componentType) {
    //alert('Adding new input component.')
    clearInputSpace();
    createInputHeader();

    // Replace the dynamic add button on the input side with a fixed
    // button chosen by the connect from type
    var input_space = document.getElementById('wsInput');

    /*  Button as anchor type */
    var work_item = document.createElement("div");
    var work_button = document.createElement("a");
    work_button.href = '#';
    work_item.className = "inputComponent";

    work_item.onclick = function() {
        /* TODO: take Docker specifics out of here */
        $('#newDTRWorkspace').modal('show');
        hideAllAttributes();
    }

    /* TODO: make this dynamic */
    if(componentType == 'docker') {
        work_button.alt = "Docker DTR";
        work_button.innerHTML = "<img class='dockerImage icon' src='static/images/docker-official.svg'></img>";
    }

    work_button.id = 'workButtonInput';

    work_item.appendChild(work_button);
    input_space.appendChild(work_item);
}

function clearInputSpace() {
    var input_space = document.getElementById('wsInput');
    while (input_space.firstChild) {
        input_space.removeChild(input_space.firstChild);
    }
}

function createInputHeader() {
    var input_space = document.getElementById('wsInput');
    var input_header = document.createElement("H2");

    input_header.id = 'workSubHeader';

    input_header.appendChild(document.createTextNode("From"))
    input_space.appendChild(input_header);
}

function createInputSection(id) {
    var input_space = document.getElementById('wsInput');
    var action = new XMLHttpRequest();

    action.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var results = JSON.parse(this.responseText);
            console.log(results);
            if (results.length > 0) {
                // TODO: Remove Docker specifics
                AddInputComponent('docker');
                $('#workButtonInput').attr('id', results[0]['job_id']);
                updateComponents('docker');
            }
            else {
                // New entry
                var input_section = document.createElement("div");
                input_section.className = "dropdown inputButtonSection";
                var input_button = document.createElement("a");
                input_button.alt = "Add input item."
                input_button.href = '#';
                input_button.className = "dropdown-toggle";
                input_button.setAttribute("data-toggle", "dropdown");
                input_button.innerHTML = "<img class='inputButton icon' src='static/images/add.svg'></img>";

                var input_buttion_list = document.createElement("ul");
                input_buttion_list.className = "dropdown-menu";
                input_buttion_list.innerHTML = "<li><a href='#' id='dockerItem'><img class='dockerImage icon' src='static/images/docker-official.svg'></img></a></li>";

                input_section.appendChild(input_buttion_list);
                input_section.appendChild(input_button);
                input_space.appendChild(input_section);

                // TODO: Remove Docker specifics
                $('#dockerItem').click(function(e){
                    e.preventDefault();
                    var componentType = 'docker';
                    AddInputComponent(componentType);
                    sendComponentToServer(componentType, $('.list-group-item.active').attr('id'));
                });
            }
       }
    };
    action.open('GET', '/components?uuid='+id);
    action.send();
}

function clearAddComponentButton() {
    $('.dropdown.outputButtonSection').remove();
}

function AddOutputComponent(componentType) {
    //alert('Adding new output component.')

    //clearOutputSpace();
    clearAddComponentButton();
    //createOutputHeader();

    var output_space = document.getElementById('wsOutput');

    /*  Button as anchor type */
    var work_item = document.createElement("div");
    var work_button = document.createElement("a");
    work_button.href = '#';
    work_item.className = "outputComponent "+componentType;

    /* TODO: make this dynamic */
    if(componentType == 'slack' || componentType == 'slack_workspace') {
        work_button.alt = "Slack"
        work_button.innerHTML = "<img class='slackImage icon' src='static/images/slack-1.svg'></img>";
        work_item.onclick = function() {
            hideAllAttributes();
            $('#attributes').load('/attributes?job='+work_button.id, function()
                {
                    data = JSON.parse(text);
                    $('.pluginAttributes').removeClass('hidden');
                    $('#attributes').removeClass('hidden');
                });
        }
    }

    /* TODO: make this dynamic */
    if(componentType == 'spark') {
        work_button.alt = "Spark"
        work_button.innerHTML = "<img class='sparkImage icon' src='static/images/spark-logo.svg'></img>";
        work_item.onclick = function() {
            hideAllAttributes();
            $('#attributes').load('/attributes?job='+work_button.id, function()
                {
                    data = JSON.parse(text);
                    $('.pluginAttributes').removeClass('hidden');
                    $('#attributes').removeClass('hidden');
                });
        }
    }

    work_button.id = 'workButtonOutput';
    work_item.appendChild(work_button);
    output_space.appendChild(work_item);
}

function hideAllAttributes() {
    var attributes = document.getElementById('attributes');
    // Clear out all child elements for new workspace
    while (attributes.firstChild) {
        attributes.removeChild(attributes.firstChild);
    }
    $('#attributes').addClass('hidden');
}

function clearOutputSpace() {
    var output_space = document.getElementById('wsOutput');
    while (output_space.firstChild) {
        output_space.removeChild(output_space.firstChild);
    }
}

function createOutputHeader() {
    var output_space = document.getElementById('wsOutput');
    var output_header = document.createElement("H2");

    output_header.id = 'workSubHeader';

    output_header.appendChild(document.createTextNode("To"))
    output_space.appendChild(output_header);
}

function createOutputSection(id) {
    var output_space = document.getElementById('wsOutput');
    var action = new XMLHttpRequest();

    action.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var results = JSON.parse(this.responseText);
            console.log(results);
            if (results.length > 0) {
                results.forEach(function(component){
                    var componentType = component['component'];
                    var direction = component['direction'];
                    var job_id = component['job'];

                    AddOutputComponent(componentType);
                    $('#workButtonInput').attr('id', job_id);
                    //updateComponents(componentType);
                });
            }
            else {
                // New entry
                var output_section = document.createElement("div");
                output_section.className = "dropdown outputButtonSection";
                var output_button = document.createElement("a");
                output_button.alt = "Add output item."
                output_button.href = '#';
                output_button.className = "dropdown-toggle";
                output_button.setAttribute("data-toggle", "dropdown");
                output_button.innerHTML = "<img class='outputButton icon' src='static/images/add.svg'></img>";

                var output_buttion_list = document.createElement("ul");
                output_buttion_list.className = "dropdown-menu";
                output_buttion_list.innerHTML =
                    "<li><a href='#' id='slackItem'><img class='slackImage icon' src='static/images/slack-1.svg'></img></a></li><li><a href='#' id='sparkItem'><img class='sparkImage icon' src='static/images/spark-logo.svg'></img></a></li>";

                output_section.appendChild(output_buttion_list);
                output_section.appendChild(output_button);
                output_space.appendChild(output_section);

                // TODO: make these generic and consolidate
                $('#slackItem').click(function(e){
                    e.preventDefault();
                    AddOutputComponent('slack');
                    sendComponentToServer('slack', $('.list-group-item.active').attr('id'));
                });

                $('#sparkItem').click(function(e){
                    e.preventDefault();
                    AddOutputComponent('spark');
                    sendComponentToServer('spark', $('.list-group-item.active').attr('id'));
                });
            }
       }
    };
    action.open('GET', '/components?uuid='+id);
    action.send();
}

function GetWorkflows()
{
    var workspace_action = new XMLHttpRequest();

    workspace_action.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var results = JSON.parse(this.responseText);
            console.log(results);
            AddWorkflowToGUI(results);
       }
    };
    workspace_action.open('GET', '/workspace');
    workspace_action.send();
}

function AddWorkflow() {
    console.log(workflows)
    var value=$('#workspace_name').val();
    var workspace_action = new XMLHttpRequest();

    workspace_action.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var results = JSON.parse(this.responseText);
            console.log(results);
            AddWorkflowToGUI(results);
       }
    };
    workspace_action.open('POST', '/workspace');
    workspace_action.send(JSON.stringify(value));
}

function AddWorkflowToGUI(elements) {
    var list = document.getElementById('workflows');
    // Clear out all child elements for new workspace
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    elements.forEach(function(element) {
        var entry = document.createElement('li');
        entry.className = "list-group-item";
        entry.setAttribute('id', element.id);

        entry.onclick = function() {
            loadWorkflow(element.name, element.id);
            }
        entry.appendChild(document.createTextNode(element.name));
        list.appendChild(entry);
    });
}

