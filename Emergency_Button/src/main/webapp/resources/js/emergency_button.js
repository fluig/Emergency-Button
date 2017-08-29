var emergencyButton = SuperWidget.extend({
	editMode: false,
	viewMode: false,
	
	usuariosAlvo: null, 
	usuariosAdministradores: null,
	
	listaDeUsuariosAlvos: [],
	listaDeUsuariosAdministradores: [],
	
	listaDeEmailsDosAdministradores: [],
	
	moduleKey: 'FLUIG_MODULE',
	eventKey: 'EMERGENCY_BUTTON',
	
	enviarNotificacao: function() {
		var $this = this;
    	
    	$.each($this.listaDeUsuariosAdministradores, function(key, item) {
    		// send notification
    		$.ajax({
        		contentType: "application/json",
        		data: JSON.stringify({
        			"eventKey": $this.eventKey,
        			"loginReceiver":item,
        			"priority" : "HIGH", 
        			"object" : { 
        				// the object of the alert, such as document, post, image or process 
        			"alertObjectId" : "1", 
        			// the unique id number of the object 
        			"alertObjectTypeDescriptionKey" : "Contract", 
        			// description of the object type 
        			"alertObjectDescription" : "Agreement document", 
        			// the object description showed in the alert 
        			"alertObjectLink" : "", 
        			// the link to access the object 
        			"alertObjectDetailKey" : ""
        			}
        		}),
        		success: function(data) {
        			FLUIGC.toast({
    					title: '',
    			        message: "${i18n.getTranslation('view.email.success')}",
    			        type: 'success'
        			});
        		},
        		type:"POST",
        		url: WCMAPI.getServerURL() + "/api/public/alert/service/sendNotification"
        	});
    	});
    	
    	var listaDeEmails = [
         	$this.listaDeEmailsDosAdministradores.join(";"),
         	$("#emailsExtras", $this.getContext()).val()
        ].join(";");
    	
    	var options = {
    		url: "/ecm/api/rest/ecm/emailSender/customEmailSender/",
    		type: "POST",
    		data: JSON.stringify({
        		from: WCMAPI.user,	
        		to: listaDeEmails,
        		subject: WCMAPI.user + " ${i18n.getTranslation('view.email.title')}",  
        		templateId: 'tplFaleConosco',
        		param: {"USER": WCMAPI.user, "DATE_HOUR": moment().format('MMMM Do YYYY, h:mm:ss a')}
        	})
    	};

    	var def = new ajaxRequestDefault();
    	def.type = 'POST';

    	var config = $.extend(def, options);
    	$.ajax(config);
	},
    
    init: function() {
    	var $this = this;
    	
    	if (this.editMode) {
    		this.config();
    	}
    	
    	if (this.viewMode) {
    		this.usuariosAlvo = $("#usuariosAlvo", this.getContext()).val();
    		this.usuariosAdministradores = $("#usuariosAdministradores", this.getContext()).val();
    		
    		$this.getContext()
    		.parent()
    		.siblings(".wcm_title_widget")
    		.hide();
    		
    		$this.getListaDeUsuariosAlvos();
    		$this.getListaDeUsuariosAdministradores();
    		
    		// usuario alvo
    		if ($.inArray( WCMAPI.getUserLogin(), $this.listaDeUsuariosAlvos ) !== -1) {
    			shortcut.add('f8', function() {
        			$this.enviarNotificacao();
        		});
    		}
    		
    		// usuario administrador
    		if ($.inArray( WCMAPI.getUserLogin(), $this.listaDeUsuariosAdministradores ) !== -1) {
    			// ativa checagem de alerta
    			// coloca modal chamativo trigger("startRumble")
    			
    			$this.verificandoAlerta();
    		}
    	}
    },
  
    
    bindings: {
        local: {
        	'salvar': ['click_salvar']
        },
        global: {}
    },
    
    verificandoAlerta: function() {
    	var $this = this;
    	
    	setInterval(function() {
    		var query = [
	             'SELECT USER.LOGIN, USER.EMAIL',
	             'FROM FDN_ALERTMODULE MODULE',
	             'INNER JOIN FDN_ALERTEVENTTYPE EVENT ON (EVENT.MODULE_ID = MODULE.ID)',
	             'INNER JOIN FDN_ALERT ALERT ON (ALERT.EVENT_TYPE_ID = EVENT.ID)',
	             'INNER JOIN FDN_USERTENANT USER ON (USER.USER_TENANT_ID = ALERT.RECEIVER_ID)',
	             'WHERE',
	             'MODULE.MODULE_KEY = "' + $this.moduleKey + '" AND ',
	             'MODULE.TENANT_ID = ' + WCMAPI.getTenantId() + ' AND',
	             'EVENT.EVENT_KEY = "EMERGENCY_BUTTON" AND',
	             'ALERT.IS_READ = 0 AND',
	             'USER.LOGIN = "' + WCMAPI.getUserLogin() + '"'
	         ].join(" ");
	         var alertas = DatasetFactory.getDataset("ds_sql_consulta_fluig", [query], null, null);
	         
	         if (alertas.values.length > 0) {
	        	 
	        	 FLUIGC.toast({
	        		 title: "${i18n.getTranslation('view.button.press.success.title')} ",
	        		 message: "${i18n.getTranslation('view.button.press.success.message')}",
	        		 type: "danger"
	        	 });
	        	 
	        	 var alerta = $(".alert.alert-danger.alert-dismissible");
	        	 
	        	 alerta.jrumble({
        			x: 10,
        			y: 10,
        			rotation: 4
	        	 });
	        	 
	        	 alerta.trigger("startRumble");
	        	 
	        	 setTimeout(function() {
	        		 alerta.trigger("stopRumble");
	        	 }, 3000);
	         }
    	}, 10000);
    },
    
    config: function() {    	
    	this.verificaModulo();   
    	
    	// autocomplete
    	$.ajax({
    		error: function() {
    			FLUIGC.toast({
    				title: "${i18n.getTranslation('edit.config.group.error.title')}",
    				message: "${i18n.getTranslation('edit.config.group.error.message')}",
    				type: 'danger'
    			});
    		},
    		success: function(data) {
    			$("#usuarios-alvo, #usuarios-administradores").autocomplete({
    				source: data
    			});
    		},
    		type: "GET",
    		url: WCMAPI.getServerURL() + "/api/public/wcm/group"
    	});
    },
    
    criaModulo: function() {
    	var $this = this;
    	
    	// create module
    	var module = {
    	    data: JSON.stringify({
    	        "moduleKey" : $this.moduleKey, 
    	        "descriptionKey" : "${i18n.getTranslation('edit.module.description')}"
    	    }),
    	    success: function() {
    	        $this.verificaEvento();
    	    },
    	    type: "POST",
    	    url: WCMAPI.getServerURL() + "/api/public/alert/module/create"
    	};
    	
    	var def = new ajaxRequestDefault();
    	def.type = "POST";

    	var config = $.extend(def, module);
    	$.ajax(config);
    },
    
    criaEvento: function() {
    	var $this = this;
    	
    	$.ajax({
    		success: function(data) {
    			var id = null;
    			
    			$.each(data, function(key, item) {
    				if (item.moduleKey == $this.moduleKey) {
    					id = item.id;
    				}
    			});
    			
    			// create event
    	    	var event = {
    	    	    async: false,
    	    	    data: JSON.stringify({
    	    	    	"eventKey":$this.eventKey,
    	    	    	"required":true,
    	    	    	"descriptionKey":"${i18n.getTranslation('edit.event.description')}",
    	    	    	"singleDescriptionKey":"${i18n.getTranslation('edit.event.singledescription')}",
    	    	    	"groupDescriptionKey":"${i18n.getTranslation('edit.event.singledescription')}",
    	    	    	"moduleId":id,
    	    	    	"grouped":false,
    	    	    	"canRemove":false,
    	    	    	"removeAfterExecAction":false,
    	    	    	"onlyAdmin":false
    		    	}),
    	    	    type: "POST",
    	    	    url: WCMAPI.getServerURL() + "/api/public/alert/event/createEvent"
    	    	};
    	    	
    	    	var def = new ajaxRequestDefault();
    	    	def.type = "POST";

    	    	var config = $.extend(def, event);
    	    	$.ajax(config);
    		},
    		url: WCMAPI.getServerURL() + "/api/public/alert/module/findVoList"
    	});
    },
    
    verificaModulo: function() {
    	var $this = this;
    	
    	$.ajax({
    		success: function(data) {
    			var moduleFound = false;
    			
    			$.each(data, function(key, item) {
    				if (item.moduleKey == $this.moduleKey) {
    					moduleFound = true;
    				}
    			});
    			
    			// not found
    			if (!moduleFound) {
    				$this.criaModulo();
    			}
    			else {
    				$this.verificaEvento();
    			}
    		},
    		url: WCMAPI.getServerURL() + "/api/public/alert/module/findVoList"
    	});
    },
    
    verificaEvento: function() {
    	var $this = this;
    	
    	$.ajax({
    		error: function() {
    			$this.criaEvento();
    		},
    		success: function(data) {
    			var evento = false;
    			
    			$.each(data, function(key, item) {
    				if (item.eventKey == 'EMERGENCY_BUTTON') {
    					evento = true;
    				}
    			});
    			
    			if (!evento) {
    				$this.criaEvento();
    			}
    		},
    		type: "GET",
    		url: WCMAPI.getServerURL() + "/api/public/alert/event/eventsByModule?moduleKey=" + $this.moduleKey
    	});
    },
    
    /**
     * Save form
     */
    salvar: function() {
    	var usuariosAlvo = $("#usuarios-alvo", this.getContext()).val();
    	var usuariosAdministradores = $("#usuarios-administradores", this.getContext()).val();
    	var emailsExtras = $("#emails-extras", this.getContext()).val();
    	var emailTemplate = $("#email-template", this.getContext()).val();
    	
    	var result = WCMSpaceAPI.PageService.UPDATEPREFERENCES({async: false}, this.instanceId, {
    		'usuariosAlvo': usuariosAlvo,
    		'usuariosAdministradores': usuariosAdministradores,
    		'emailsExtras': emailsExtras,
    		'emailTemplate': emailTemplate
    	});
    	
    	if (result) {
    		FLUIGC.toast({
    			title: '${i18n.getTranslation("edit.save.success.title")} ',
    			message: '${i18n.getTranslation("edit.save.success.message")}',
    			type: 'success'
    		});
    	}
    	else {
    		FLUIGC.toast({
    			title: '${i18n.getTranslation("edit.save.error.title")} ',
    			message: '${i18n.getTranslation("edit.save.error.message")}',
    			type: 'danger'
    		});
    	}
    },
    
    getListaDeUsuariosAlvos: function() {
    	var $this = this;
    	
    	var constraints = [
            DatasetFactory.createConstraint("colleagueGroupPK.groupId", $this.usuariosAlvo, $this.usuariosAlvo, ConstraintType.MUST)
        ];
    	var dsTarget = DatasetFactory.getDataset("colleagueGroup", ["colleagueGroupPK.colleagueId"], constraints, null);
    	
    	constraints = [];
    	$.each(dsTarget.values, function(key, item) {
    		var dsc = DatasetFactory.createConstraint("colleaguePK.colleagueId", item["colleagueGroupPK.colleagueId"], item["colleagueGroupPK.colleagueId"], ConstraintType.SHOULD);
    		constraints.push(dsc);
    	});
    	
    	var dsLogins = DatasetFactory.getDataset("colleague", ["login"], constraints, null);
    	
    	$.each(dsLogins.values, function(key, item) {
    		$this.listaDeUsuariosAlvos.push(item["login"]);
    	});
    },
    
    getListaDeUsuariosAdministradores: function() {
    	var $this = this;
    	
    	var constraints = [
            DatasetFactory.createConstraint("colleagueGroupPK.groupId", $this.usuariosAdministradores, $this.usuariosAdministradores, ConstraintType.MUST)
        ];
    	var dsAdm = DatasetFactory.getDataset("colleagueGroup", ["colleagueGroupPK.colleagueId"], constraints, null);
    	
    	constraints = [];
    	$.each(dsAdm.values, function(key, item) {
    		var dsc = DatasetFactory.createConstraint("colleaguePK.colleagueId", item["colleagueGroupPK.colleagueId"], item["colleagueGroupPK.colleagueId"], ConstraintType.SHOULD);
    		constraints.push(dsc);
    	});
    	
    	var dsLogins = DatasetFactory.getDataset("colleague", ["login", "mail"], constraints, null);
    	
    	$.each(dsLogins.values, function(key, item) {
    		$this.listaDeUsuariosAdministradores.push(item["login"]);
    		$this.listaDeEmailsDosAdministradores.push(item["mail"]);
    	});
    },
    
    /**
     * Get context
     * @returns
     */
    getContext: function() {
    	if (this.context == null) {
    		this.context = $("#emergencyButton_" + this.instanceId);
    	}
    	return this.context;
    },
});

