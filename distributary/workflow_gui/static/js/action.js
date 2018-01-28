
$('#newWorkspace').on('hidden.bs.modal', function () {
    console.log('Clear input data')
    $(this).find('input').val('').end();
})

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

function loadWorkflow(name) {
    workspace = document.getElementById('workspace');

    // Clear out all child elements for new workspace
    while (workspace.firstChild) {
        workspace.removeChild(workspace.firstChild);
    }

    var h = document.createElement("H1");
    h.appendChild(document.createTextNode(name+" Workspace"))
    workspace.appendChild(h);
    workspace.className += " activeWorkspace";
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

