(function(document) {
    var selectors = {
        nojs:           '.no-javascript',
        withjs:         '.javascript',
        jobs_container: 'div[data-job-container]'
    };

    var VoteAction = function(anchor, ev) {
        this.init(anchor);
    };

    VoteAction.prototype = {
        init: function(anchor) {
            this.anchor = anchor;
            this.jobId  = anchor.getAttribute('data-vote');
        },

        notify: function(message, type) {
            new Opentip(
                this.anchor,
                message,
                {
                    style: type,
                    showOn: "creation",
                    stem: true,
                    target: true,
                    hideTrigger: 'trigger',
                    tipJoint: "bottom left",
                    targetJoint: "top right",
                    hideDelay: 2
                }
            );
        },

        onError: function(ev) {
            this.notify('There was an error submitting your vote.', 'alert');
        },

        onSuccess: function(ev) {
            if (ev.target.status === 200) {
                var response     = JSON.parse(ev.target.responseText),
                    number_votes = response.votes,
                    container    = document.querySelector('span[data-job-votes="' + this.jobId + '"]');

                if (container) {
                    container.innerText = number_votes;
                    this.notify('Your vote was successfully registered. Thank you!');
                }

                return;
            }

            this.onError(ev);
        },
        
        execute: function(ev) {
            ev.preventDefault();
            var id       = this.jobId,
                request  = new XMLHttpRequest(),
                instance = this;

            request.addEventListener('load', function(ev) {
                instance.onSuccess(ev);
            }, false);

            request.addEventListener('error', function(ev) {
                instance.onError(ev);
            }, false);

            request.addEventListener('abort', function(ev) {
                instance.onError(ev);
            }, false);

            request.open("POST", "/job/" + id + "/vote", true);
            request.send();
        }
    };

    function displayJavascriptElements() {
        var nojs         = document.querySelectorAll(selectors.nojs),
            nojs_class   = selectors.nojs.replace('.', ''),
            withjs       = document.querySelectorAll(selectors.withjs),
            withjs_class = selectors.withjs.replace('.', ''),
            i, element, css_classes;

        for (i = 0; i < nojs.length; i++) {
            element = nojs[i];
            css_classes = element.getAttribute('class').replace(nojs_class, '');
            css_classes += " hidden";
            element.setAttribute('class', css_classes);
        }

        for (i = 0; i < withjs.length; i++) {
            element = withjs[i];
            css_classes = element.getAttribute('class').replace(withjs_class, '');
            element.setAttribute('class', css_classes);
        }
    }

    function getParentAnchor(node) {
        while (node) {
            if (node.nodeType === 1 && node.nodeName.toUpperCase() === "A") {
                return node;
            }

            node = node.parentNode;
        }

        return null;
    }

    function getActionForTarget(anchor) {
        if (anchor.hasAttribute('data-vote')) {
            return new VoteAction(anchor);
        }
    }

    function createBindings() {
        var container = document.querySelector(selectors.jobs_container);
        container.addEventListener('click', function(ev) {
            var anchor_target = getParentAnchor(ev.target),
                action = anchor_target === null ? null : getActionForTarget(anchor_target);

            if (action !== null) {
                action.execute(ev);
            }
        }, true);
    }

    displayJavascriptElements();
    createBindings();

})(document);
