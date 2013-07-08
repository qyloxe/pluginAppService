/**
 * pluginAppService v0.6.6 - ICOR plugin application service
 * License: proprietary - all rights reserved
 */ 
jQuery(function(){

   jQuery.pluginAppService = function(el,options) {

      var defaults={
         pluginid:-1,
         urlJSON:'',
         historyPath: 'app',
         errorPOSTFailure: 'Wyst¹pi³ b³¹d w komunikacji z serwerem\nSkontaktuj siê z administratorem systemu w celu przekazania informacji o okolicznoœciach wyst¹pienia b³êdu.',
         vars: {},
         templates: [],
         epiceditor: {
            basePath: '/icorlib/epiceditor',
            clientSideStorage: false,
            localStorageName: 'epiceditor',
            parser: marked,
            file: {
               name: 'epiceditor',
               defaultContent: '',
               autoSave: 100
            },
            theme: {
               base:'/themes/base/epiceditor.css',
               preview:'/themes/preview/github.css',
               editor:'/themes/editor/epic-light.css'
            },
            focusOnLoad: false,
            shortcut: {
               modifier: 18,
               fullscreen: 70,
               preview: 80,
               edit: 79
            }
         },
         _pending:1
      };
      
      var plugin = this;
      
      init=function() {
         plugin.el=el;
         plugin.$el=jQuery(el);
         plugin.dTemplates={};
         plugin.dTemplatesSrc={};
         plugin.postRender=[];
         plugin.lDeferreds=[];

         Handlebars.registerHelper('add',plugin.hhAdd);
         Handlebars.registerHelper('sumRecursive',plugin.hhSumRecursive);
         Handlebars.registerHelper('maxRecursiveDate',plugin.hhMaxRecursiveDate);
         Handlebars.registerHelper('formatYMDHMS',plugin.hhFormatYMDHMS);
         Handlebars.registerHelper('formatYMDHM',plugin.hhFormatYMDHM);
         Handlebars.registerHelper('formatYMD',plugin.hhFormatYMD);
         Handlebars.registerHelper('formatHMS',plugin.hhFormatHMS);
         Handlebars.registerHelper('formatHM',plugin.hhFormatHM);
         Handlebars.registerHelper('epicEditor',plugin.hhEpicEditor);
         Handlebars.registerHelper('markdown',plugin.hhMarkdown);
         Handlebars.registerHelper('ifeq',plugin.hhIfEQ);
         Handlebars.registerHelper('ifneq',plugin.hhIfNEQ);
         Handlebars.registerHelper('ifge',plugin.hhIfGE);
         Handlebars.registerHelper('ifle',plugin.hhIfLE);
         Handlebars.registerHelper('ifleq',plugin.hhIfLEQ);
         Handlebars.registerHelper('ifgeq',plugin.hhIfGEQ);

         plugin.settings = jQuery.extend({},defaults,options,plugin.$el.data('plugin-options'));

         if (plugin.settings.handlebarsHelpers) {
            for (ihh in plugin.settings.handlebarsHelpers) {
               Handlebars.registerHelper(ihh,plugin.settings.handlebarsHelpers[ihh]);
            }
         }

         if (plugin.settings.templates) {
            plugin.registerTemplates.call(plugin,plugin.settings.templates);
         }
         
         if (plugin.settings.clickEvents) {
            for (ice in plugin.settings.clickEvents) {
               if (plugin.settings.clickEvents[ice]['onClick']) {
                  plugin.registerClickEvent(ice,plugin.settings.clickEvents[ice]['onClick'],plugin.settings.clickEvents[ice]['onCall']);
               } else {
                  plugin.registerClickEvent(ice,plugin.settings.clickEvents[ice]['onCall']);
               }
            }
         }

         if (plugin.settings.onInit) {
            plugin.settings.onInit.call(plugin);
         }
      };

      plugin.hhAdd = function(element,value) {
         return element+value;
      };
      
      plugin.hhIfEQ=function(conditional,value,options) {
         if (conditional==value) {
            return options.fn(this);
         } else {
            return options.inverse(this);
         }
      };
      plugin.hhIfNEQ=function(conditional,value,options) {
         if (conditional!=value) {
            return options.fn(this);
         } else {
            return options.inverse(this);
         }
      };
      plugin.hhIfGE=function(conditional,value,options) {
         if (conditional>value) {
            return options.fn(this);
         } else {
            return options.inverse(this);
         }
      };
      plugin.hhIfLE=function(conditional,value,options) {
         if (conditional<value) {
            return options.fn(this);
         } else {
            return options.inverse(this);
         }
      };
      plugin.hhIfGEQ=function(conditional,value,options) {
         if (conditional>=value) {
            return options.fn(this);
         } else {
            return options.inverse(this);
         }
      };
      plugin.hhIfLEQ=function(conditional,value,options) {
         if (conditional<=value) {
            return options.fn(this);
         } else {
            return options.inverse(this);
         }
      };
      
      plugin.dateToYMD=function(date) {
          var d=date.getDate();
          var m=date.getMonth()+1;
          var y=date.getFullYear();
          return ''+y+'-'+(m<=9?'0'+m:m)+'-'+(d<=9?'0'+d:d);
      };
      
      plugin.dateToHMS=function(date) {
          var h=date.getHours();
          var m=date.getMinutes();
          var s=date.getSeconds();
          return ''+(h<=9?'0'+h:h)+':'+(m<=9?'0'+m:m)+':'+(s<=9?'0'+s:s);
      };
      
      plugin.dateToHM=function(date) {
          var h=date.getHours();
          var m=date.getMinutes();
          return ''+(h<=9?'0'+h:h)+':'+(m<=9?'0'+m:m);
      };

      plugin.parseDate = function(dateStr) {
         if (typeof dateStr==='string') {
            var a=dateStr.split("T");
            var d=a[0].split("-");
            var t=a[1].split(":");
            return new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]);
         }
         return dateStr;
      }
      
      plugin.hhFormatYMDHMS = function(element) {
         var s='-';
         if (element) {
            var bdate=plugin.parseDate(element);
            s=plugin.dateToYMD(bdate)+' '+plugin.dateToHMS(bdate);
         }
         return s;
      };
      
      plugin.hhFormatYMDHM = function(element) {
         var s='-';
         if (element) {
            var bdate=plugin.parseDate(element);
            s=plugin.dateToYMD(bdate)+' '+plugin.dateToHM(bdate);
         }
         return s;
      };
      
      plugin.hhFormatYMD = function(element) {
         var s='-';
         if (element) {
            var bdate=plugin.parseDate(element);
            s=plugin.dateToYMD(bdate);
         }
         return s;
      };
      
      plugin.hhFormatHMS = function(element) {
         var s='-';
         if (element) {
            var bdate=plugin.parseDate(element);
            s=plugin.dateToHMS(bdate);
         }
         return s;
      };
      
      plugin.hhFormatHM = function(element) {
         var s='-';
         if (element) {
            var bdate=plugin.parseDate(element);
            s=plugin.dateToHM(bdate);
         }
         return s;
      };
      
      plugin.hhSumRecursive = function(element,value) {
         function _hhSumRecursive(bitem) {
            if (!bitem) {
               return 0;
            }
            var v=parseInt(bitem[value]);
            if (jQuery.isArray(bitem[element])) {
               for (var i=0; i<bitem[element].length; i++) {
                  v+=_hhSumRecursive(bitem[element][i]);
               }
            } else if (bitem[element]) {
               v+=_hhSumRecursive(bitem[element]);
            };
            return v;
         };
         return _hhSumRecursive(this);
      };
      
      plugin.hhMaxRecursiveDate = function(element,value,adefault) {
         function _compareMaxDD(d1,d2) {
            if (!d1) {
               return d2;
            }
            if (!d2) {
               return d1;
            }
            if (d1>d2) {
               return d1;
            }
            return d2;
         }
         function _hhMaxRecursiveDate(bitem) {
            var v=undefined;
            if (!bitem) {
               return v;
            }
            if (bitem[value]) {
               var v=plugin.parseDate(bitem[value]);
            }
            if (jQuery.isArray(bitem[element])) {
               for (var i=0; i<bitem[element].length; i++) {
                  v=_compareMaxDD(v,_hhMaxRecursiveDate(bitem[element][i]));
               }
            } else if (bitem[element]) {
               v=_compareMaxDD(v,_hhMaxRecursiveDate(bitem[element]))
            };
            return v;
         };
         var v=_hhMaxRecursiveDate(this);
         if (v) {
            return plugin.hhFormatYMDHMS(v);
         }
         if (!adefault) {
            adefault='';
         }
         return adefault;
      };
      
      plugin.hhEpicEditor=function(elementid,options) {
         var sc='';
         if (options.hash["class"]) {
            sc=' class="'+options.hash["class"]+'"';
         }
         plugin.postRender.push(function(){
            var editor=plugin.createEpicEditor(elementid);
            if (options.hash.text) {
              editor.importFile("markdown",options.hash.text);
            }
         });
         return new Handlebars.SafeString('<div'+sc+' id="'+elementid+'"></div>');
      };
      
      plugin.hhMarkdown=function(element) {
         var s='';
         if (element) {
            s=marked(element);
         }
         return new Handlebars.SafeString(s);
      };

      plugin.createEpicEditor = function(acontainer){
         var opts = jQuery.extend({},plugin.settings.epiceditor,{container: acontainer});
         var editor = new EpicEditor(opts);
         editor.load();
         jQuery("#"+acontainer).data("epiceditor",editor);
         //jQuery("#"+acontainer).css({height:'404px'});
         //editor.reflow('height');
         return editor;
      };

      plugin.registerTemplate = function(atemplate){
         var dec=jQuery.Deferred();
         var dpr=dec.promise();
         plugin.lDeferreds.push(dpr);
         jQuery.ajax({
            url:'PLUGIN_TEMPLATE_'+plugin.settings.pluginid+'_'+atemplate+'.asp',
            async:true,
            cache:false,
            dataType:'text',
            success:function(data,status,xhr) {
               var s='\n<!-- TEMPLATE START: '+atemplate+' -->\n'+xhr.responseText+'\n<!-- TEMPLATE END: '+atemplate+' -->\n';
               plugin.dTemplatesSrc[atemplate]=s;
               dec.resolve();
            }
         });
         return dpr;
      };
      
      plugin.registerTemplates = function(ltemplates) {
         jQuery.map(ltemplates,function(atemplate,i){
            plugin.registerTemplate(atemplate);
         });
      };

      plugin.registerClickEvent = function(eventname,funcClick,funcCall) {
         if (arguments.length==2) {
            funcCall=funcClick;
            funcClick=function() {
               return {};
            };
         }
         plugin['_do'+eventname]=funcCall;
         plugin['_cl'+eventname]=function(event,defaults){
            if (plugin.settings._pending) {
               return false;
            }
            if (event) {
               //event.stopPropagation();
               //jQuery('.dropdown.open .dropdown-toggle').dropdown('toggle');
               jQuery('[data-toggle="dropdown"]').parent().removeClass('open');
            }
            var params=funcClick.call(this,event);
            if (typeof params === 'undefined'){
               params={};
            }
            if (params!=false) {
               params.m=eventname;
               params=jQuery.extend(params,defaults);
               if (params.noHistory) {
                  plugin['_do'+eventname].call(plugin,params);
               } else {
                  jQuery.address.value(plugin.settings.historyPath+'?'+jQuery.param(params));
               }
            }
            return false;
         };
         jQuery(plugin.el).delegate('.'+eventname,'click',plugin['_cl'+eventname]);
      };
      
      plugin.renderHTMLTemplate = function(adata,atemplate,atarget,callback){
         var template=plugin.dTemplates[atemplate];
         plugin.postRender=[];
         if (!template) {
            var template=plugin.dTemplatesSrc[atemplate];
            if (!template) {
               template=Handlebars.compile(jQuery(atemplate).html());
            } else {
               jQuery.map(plugin.dTemplatesSrc,function(tvalue,tkey){
                  var template=Handlebars.compile(tvalue);
                  plugin.dTemplates[tkey]=template;
                  Handlebars.registerPartial(tkey,template);
               });
               template=plugin.dTemplates[atemplate];
            }
         }
         var atext=template(adata);
         atarget.html(atext);
         jQuery.map(plugin.postRender,function(f,i){
            f.call(plugin);
         });
         plugin.postRender=[];
         if (callback) {
            callback.call(this,adata);
         }
      };
      
      plugin.renderXMLTemplate = function(aparams,atemplate,atarget,callback){
         return jQuery.get(plugin.settings.urlJSON,aparams,function(data){
            var json=jQuery.xml2json(data);
            if (atarget) {
               plugin.renderHTMLTemplate(json,atemplate,atarget);
            }
            if (callback) {
               callback.call(this,json);
            }
         },"html");
      };

      plugin.renderJSONTemplate = function(aparams,atemplate,atarget,callback){
         return jQuery.get(plugin.settings.urlJSON,aparams,function(json){
            if (atarget) {
               plugin.renderHTMLTemplate(json,atemplate,atarget);
            }
            if (callback) {
               callback.call(this,json);
            }
         },"json");
      };
      
      plugin.callEvent = function(eventname,event,defaults) {
         plugin['_cl'+eventname].call(this,event,defaults);
      };
      
      jQuery.address.change(function(event) {
         if (jQuery.isEmptyObject(event.parameters)) {
            return false;
         }
         if (plugin.settings._pending) {
            return false;
         }
         var m=event.parameters.m;
         var url=event.path;
         if (url=='/'+plugin.settings.historyPath) {
            plugin['_do'+event.parameters.m].call(plugin,event.parameters);
         }
         return false;
      });
      
      plugin.postData = function(data,onsuccess,onfailure) {
         if (!onfailure) {
            onfailure=function(jqXHR,textStatus,errorThrown) {
               alert(plugin.settings.errorPOSTFailure);
            };
         }
         return jQuery.ajax({
            type: 'POST',
            url: plugin.settings.urlJSON,
            cache:false,
            data: data,
            success: function(data,textStatus,jqXHR) {
               if (!data) {
                  onfailure.call(this,jqXHR,textStatus);
               } else {
                  onsuccess.call(this,data,textStatus,jqXHR);
               }
            },
            error: onfailure,
            dataType: "json"
         });
      };
      
      plugin.registerClickEvent('evBack',
         function (params) {
            window.history.go(-2);
         }
      );

      init();
      
      jQuery.when.apply(plugin,plugin.lDeferreds).then(function(){
         plugin.settings._pending=0;
         if (plugin.settings.onStart) {
            plugin.settings.onStart.call(plugin);
         }
      });
      
   };
});
