
var workflows = []

$(document).ready(function () {
    console.log("document ready");

    $(".list-group").on('click', 'li', function() {
        console.log('Clear active state');
        $(".list-group li").removeClass('active');
        $(this).addClass('active');
    });

    $(".modal").on("hidden.bs.modal", function(){
        console.log('Hiding modal');
        var modal = $(this);
        modal.find('.modal-body input').val("");
    });

    tmp = sessionStorage.getItem("savedWorkflows")

    if(tmp != null) {
        workflows = JSON.parse(tmp);
        workflows.forEach(function(element){
            AddWorkflowToGUI(element);
            });
        }
    })

function AddInputComponent() {
    alert('Adding new input component.')
}

function AddOutputComponent() {
    alert('Adding new output component.')
}

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

    header.appendChild(document.createTextNode(name+" workspace"))
    h.appendChild(header);

    workspace.className += " activeWorkspace";

    var input_space = document.getElementById('wsInput');
    while (input_space.firstChild) {
        input_space.removeChild(input_space.firstChild);
    }

    var input_header = document.createElement("H2");
    input_header.id = 'inputHeader';

    input_header.appendChild(document.createTextNode("Connect from..."))
    input_space.appendChild(input_header);

    /*  Button as anchor type */
    var input_section = document.createElement("div");
    input_section.className = "dropdown";
    var input_button = document.createElement("a");
    //input_button.onclick = function(){AddInputComponent()};
    input_button.alt = "Add input item."
    input_button.href = '#';
    input_button.className = "dropdown-toggle";
    input_button.setAttribute("data-toggle", "dropdown");
    input_button.innerHTML = "<img class='inputButton' src='static/images/add.svg'></img>";

    var input_buttion_list = document.createElement("ul");
    input_buttion_list.className = "dropdown-menu";
    input_buttion_list.innerHTML = "<li><a href='#'><img class='dockerImage' src='static/images/docker-official.svg'></img></a></li>";

    input_section.appendChild(input_buttion_list);
    input_section.appendChild(input_button);
    input_space.appendChild(input_section);



    var output_space = document.getElementById('wsOutput');
    while (output_space.firstChild) {
        output_space.removeChild(output_space.firstChild);
    }

    var output_header = document.createElement("H2");
    output_header.id = 'outputHeader';

    output_header.appendChild(document.createTextNode("Connect to..."))
    output_space.appendChild(output_header);

    /*  Button as anchor type */
    var output_section = document.createElement("div");
    output_section.className = "dropdown";
    var output_button = document.createElement("a");
    //input_button.onclick = function(){AddInputComponent()};
    output_button.alt = "Add input item."
    output_button.href = '#';
    output_button.className = "dropdown-toggle";
    output_button.setAttribute("data-toggle", "dropdown");
    output_button.innerHTML = "<img class='inputButton' src='static/images/add.svg'></img>";

    var output_buttion_list = document.createElement("ul");
    output_buttion_list.className = "dropdown-menu";
    output_buttion_list.innerHTML =
        "<li><a href='#'><img class='slackImage' src='static/images/slack-1.svg'></img></a></li><li><a href='#'><img class='sparkImage' src='static/images/CiscoSpark--228528873.png'></img></a></li>";

    output_section.appendChild(output_buttion_list);
    output_section.appendChild(output_button);
    output_space.appendChild(output_section);
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

