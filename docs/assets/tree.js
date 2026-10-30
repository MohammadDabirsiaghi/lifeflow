"use strict";

(function () {

    document.addEventListener("DOMContentLoaded", init);

    function init() {

        loadTreeProjects();
    }



    async function loadTreeProjects() {
    
     
        try {
            const result = await window.ApiClient.get({
                action: "listCategories",
            });

            const projects = result.data || [];
            renderProjectsTree(projects);

           
        } catch (error) {
           
        } finally {
           
        }
    }

    async function loadTreeProjects() {
        try {
            const result = await window.ApiClient.get({
                action: "listCategories"
            });

            if (!result || !result.ok) {
                throw new Error(result?.message || "Failed to load projects");
            }

            const projects = Array.isArray(result.data) ? result.data : [];
         
           
            const treeData = mapProjectsToTreeData(projects);

            renderProjectsTree(treeData);

        } catch (error) {
            console.error("loadTreeProjects error:", error);

        }
    }

    function mapProjectsToTreeData(projects) {
        return projects
            .filter(item => item.Id) // فقط آیتم‌های معتبر
            .map(item => ({
                id: String(item.Id).trim(),
                parent: item.ParentId
                    ? String(item.ParentId).trim()
                    : "#",
                text:"["+ item.TitleFa || "بدون عنوان",
                data: item
            }));
    }

    function renderProjectsTree(treeData) {

        const $tree = $("#projectsTree");

        if ($tree.data("jstree")) {
            $tree.jstree(true).destroy();
        }

        $tree.jstree({
            core: {
                data: treeData,
                multiple: false,
                themes: {
                    responsive: true,
                    dots: true,
                    icons: true

                }
            },

            plugins: ["wholerow"]
        })
            // .on('loaded.jstree', function () {
            // $(this).jstree('open_all');
            // })
            ;
        $tree.on("select_node.jstree", function (e, data) {
            console.log("selected node:", data.node);
            console.log("raw project:", data.node.data);
        });
    }

})();
