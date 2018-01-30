
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
    });

    // workflow creation modal, when hiding, clear text entry field
    $(".modal").on("hidden.bs.modal", function(){
        console.log('Hiding modal');
        var modal = $(this);
        modal.find('.modal-body input').val("");
    });

    $('#attributes').addClass('hidden');
    hideAllAttributes();

    // store the workflows in the session cache to retain across
    // refreshes - will be replaced by server side code  [SERVER]
    tmp = sessionStorage.getItem("savedWorkflows")

    if(tmp != null) {
        // convert object to string to save in session
        workflows = JSON.parse(tmp);
        workflows.forEach(function(element){
            AddWorkflowToGUI(element);
            });
        }
    })


// Create the center workspace area
function loadWorkflow(name) {
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
    createInputSection();

    // Prep right side of workspace
    clearOutputSpace();
    createOutputHeader();
    createOutputSection();

    $('#workspace').removeClass('hidden');
}

function connectComponents() {
//    var inputComponent = $('.inputComponent');
//    var outputComponent = $('.outputComponent');
////
//    if(inputComponent.length > 0 && outputComponent.length > 0) {
//      var centerWorkspace = document.getElementById('wsCenter');
//      var arrowSpan = document.createElement('span');
//
//      arrowSpan.innerHTML = '&#8594;'
//      centerWorkspace.appendChild(arrowSpan);
//
////        var pos1 = inputComponent.offset();
////        var pos2 = outputComponent.offset();
////        var svg = document.createElement('svg');
////        var line = document.createElement('line');
////
////        line.className = 'connectorLine';
////        svg.appendChild(line);
////        document.body.appendChild(svg);
////
////        line = $('.connectorLine');
////
////        line.attr('x1',pos1.left).attr('y1',pos1.top).attr('x2',pos2.left).attr('y2',pos2.top);
//    }
}

function openAttributes() {
    //alert('Attributes!');
    $('#attributes').removeClass('hidden');
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
        hideAllAttributes();
        openAttributes();
        $('.dockerAttributes').removeClass('hidden');
    }

    if(componentType == 'docker') {
        work_button.alt = "Docker DTR";
        work_button.innerHTML = "<img class='dockerImage icon' src='static/images/docker-official.svg'></img>";
    }
    work_button.id = 'workButtonInput';

    work_item.appendChild(work_button);
    input_space.appendChild(work_item);

    connectComponents();
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

function createInputSection() {
    var input_space = document.getElementById('wsInput');

    /*  Button as anchor type */
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

    $('#dockerItem').click(function(e){
        e.preventDefault();
        AddInputComponent('docker');
    });

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
    work_item.className = "outputComponent";

    if(componentType == 'slack') {
        work_button.alt = "Slack"
        work_button.innerHTML = "<img class='slackImage icon' src='static/images/slack-1.svg'></img>";
        work_item.onclick = function() {
            hideAllAttributes();
            openAttributes();
            $('.slackAttributes').removeClass('hidden');
            }
    }

    if(componentType == 'spark') {
        work_button.alt = "Spark"
        work_button.innerHTML = "<img class='sparkImage icon' src='static/images/spark-logo.svg'></img>";
        work_item.onclick = function() {
            hideAllAttributes();
            openAttributes();
            $('.sparkAttributes').removeClass('hidden');
            }
    }

    work_button.id = 'workButtonOutput';
    work_item.appendChild(work_button);
    output_space.appendChild(work_item);

    createOutputSection();

    connectComponents();
}

function hideAllAttributes() {
    $('.dockerAttributes').addClass('hidden');
    $('.slackAttributes').addClass('hidden');
    $('.sparkAttributes').addClass('hidden');

    var item = $('.slackAttributes')
    item.find('input').val('');

    var item2 = $('.sparkAttributes')
    item2.find('input').val('');
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

function createOutputSection() {
    var output_space = document.getElementById('wsOutput');

    /*  Button as anchor type */
    var output_section = document.createElement("div");
    output_section.className = "dropdown outputButtonSection";
    var output_button = document.createElement("a");
    output_button.alt = "Add input item."
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

    $('#slackItem').click(function(e){
        e.preventDefault();
        AddOutputComponent('slack');
        hideAllAttributes();
    });

    $('#sparkItem').click(function(e){
        e.preventDefault();
        AddOutputComponent('spark');
        hideAllAttributes();
    });
}

function AddWorkflow() {
    console.log(workflows)
    var workspace = document.getElementById('workspace_name').value;
    workflows.push(workspace);
    sessionStorage.setItem("savedWorkflows", JSON.stringify(workflows));
    AddWorkflowToGUI(workspace);
}

function AddWorkflowToGUI(element) {
    var list = document.getElementById('workflows');
    var entry = document.createElement('li');
    entry.className = "list-group-item";
    entry.onclick = function() {
        loadWorkflow(element);
        }
    entry.appendChild(document.createTextNode(element));
    list.appendChild(entry);
}

