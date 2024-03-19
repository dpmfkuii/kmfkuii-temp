import fs from "fs";
import readdr from "fs-readdir-recursive";
import {
    path_resolve,
    path_relative,
    public_path,
    is_prod,
    log,
    mkdir,
    write,
    watch,
} from "./util.js";

const build_html = async () => {
    const pages_to_merge = fs.readdirSync(path_resolve("../html/pages"));

    log(
        36,
        "i html:",
        "building [" + pages_to_merge.join(", ").replaceAll(".html", "") + "]"
    );

    pages_to_merge.forEach((page_name) => {
        const p = path_resolve("../html/pages/", page_name);
        if (fs.existsSync(p)) {
            let page_content = fs.readFileSync(p).toString();
            const page_content_lines = page_content.split("\n");
            const template_tags = [];

            for (let i = 0; i < page_content_lines.length; i++) {
                if (page_content_lines[i].indexOf("<insert-template") > -1) {
                    if (page_content_lines[i].indexOf("<!--") < 0) {
                        template_tags.push({
                            i,
                            line: page_content_lines[i],
                        });
                    }
                }
            }

            template_tags.forEach((template_tag) => {
                // replace template tag with the requested content
                const template_name = template_tag.line
                    .split("<insert-template-")[1]
                    .split(" />")[0];

                const template_p = path_resolve(
                    "../html/templates/",
                    template_name + ".html"
                );

                if (fs.existsSync(template_p)) {
                    const template_content = fs
                        .readFileSync(template_p)
                        .toString();

                    page_content_lines[template_tag.i] = template_content;
                }
            });

            page_content = page_content_lines.join("");

            const build_path = path_resolve(public_path, page_name);

            log(32, "+ html:", path_relative(build_path));

            fs.writeFileSync(build_path, page_content);
        }
    });
};

log(36, "i dev:", `start development${is_prod ? " (prod)" : ""}`);

log(36, "i dev:", "start watching");

log(36, "i dev:", "building once");
await build_html();

watch(
    path_resolve("../html"),
    (name) => /\.html$/i.test(name),
    async () => {
        await build_html();
    }
);
